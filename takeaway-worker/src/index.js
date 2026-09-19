const MAX_CHUNKS = 40;
const MAX_CHUNK_BYTES = 10 * 1024 * 1024;
const MAX_JOURNEY_BYTES = 100 * 1024 * 1024;
const DAILY_UPLOAD_BYTES = 2 * 1000 * 1000 * 1000;
const DAILY_R2_WRITES = 20000;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return handleOptions(request, env);
        }

        if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/j/")) {
            const allowed = await requestRateLimit(request, env);
            if (!allowed) {
                return withCors(
                    json({ error: "Too many takeaway requests. Please try again later." }, 429),
                    request,
                    env
                );
            }
        }

        const journeyMatch = url.pathname.match(/^\/api\/journeys\/([^/]+)$/);
        const chunkMatch = url.pathname.match(/^\/api\/journeys\/([^/]+)\/chunks\/(\d+)$/);
        const completeMatch = url.pathname.match(/^\/api\/journeys\/([^/]+)\/complete$/);
        const pageMatch = url.pathname.match(/^\/j\/([^/]+)$/);
        const imageMatch = url.pathname.match(/^\/j\/([^/]+)\/chunks\/(\d+)\.webp$/);

        if (request.method === "POST" && url.pathname === "/api/journeys") {
            return withCors(await createJourney(request, env, url), request, env);
        }

        if (request.method === "PUT" && chunkMatch) {
            return withCors(
                await uploadChunk(request, env, chunkMatch[1], Number(chunkMatch[2])),
                request,
                env
            );
        }

        if (request.method === "POST" && completeMatch) {
            return withCors(await completeJourney(request, env, completeMatch[1]), request, env);
        }

        if (request.method === "GET" && journeyMatch) {
            return withCors(await getJourney(env, journeyMatch[1]), request, env);
        }

        if (request.method === "GET" && pageMatch) {
            return renderJourneyPage(env, pageMatch[1], url.origin);
        }

        if (request.method === "GET" && imageMatch) {
            return getJourneyImage(env, imageMatch[1], Number(imageMatch[2]));
        }

        return json({ error: "Not found." }, 404);
    }
};

async function createJourney(request, env, url) {
    if (!originIsAllowed(request, env)) {
        return json({ error: "This origin is not allowed." }, 403);
    }

    let input;

    try {
        input = await request.json();
    } catch (error) {
        return json({ error: "The journey details are not valid JSON." }, 400);
    }

    const chunkCount = Number(input.chunkCount);
    const width = Number(input.width);
    const height = Number(input.height);

    if (!Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > MAX_CHUNKS) {
        return json({ error: "The fragment count is outside the allowed range." }, 400);
    }

    if (!Number.isInteger(width) || width < 1 || width > 10000 ||
        !Number.isInteger(height) || height < 1 || height > 250000) {
        return json({ error: "The capture dimensions are outside the allowed range." }, 400);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const retentionHours = Math.max(1, Number(env.RETENTION_HOURS) || 24);
    const expiresAt = new Date(createdAt.getTime() + retentionHours * 60 * 60 * 1000);
    const manifest = {
        version: 1,
        status: "uploading",
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        chunkCount,
        width,
        height,
        uploadedChunks: []
    };

    const quotaResponse = await callQuota(env, "/reserve-journey", {
        id,
        chunkCount,
        expiresAt: manifest.expiresAt
    });
    if (!quotaResponse.ok) return quotaResponse;

    await saveManifest(env, id, manifest);

    return json({
        id,
        shareUrl: `${url.origin}/j/${id}`,
        expiresAt: manifest.expiresAt
    }, 201);
}

async function uploadChunk(request, env, id, index) {
    if (!originIsAllowed(request, env)) {
        return json({ error: "This origin is not allowed." }, 403);
    }

    const manifest = await readActiveManifest(env, id);
    if (manifest instanceof Response) return manifest;

    if (!Number.isInteger(index) || index < 0 || index >= manifest.chunkCount) {
        return json({ error: "This fragment number is not valid." }, 400);
    }

    if (manifest.uploadedChunks.includes(index)) {
        return json({ error: "This fragment has already been uploaded." }, 409);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (contentType !== "image/webp") {
        return json({ error: "Only WebP fragments are accepted." }, 415);
    }

    const declaredSize = Number(request.headers.get("Content-Length") || 0);
    if (declaredSize > MAX_CHUNK_BYTES) {
        return json({ error: "This fragment is too large." }, 413);
    }

    const bytes = await request.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_CHUNK_BYTES) {
        return json({ error: "This fragment is empty or too large." }, 413);
    }

    const quotaResponse = await callQuota(env, "/reserve-bytes", {
        id,
        index,
        bytes: bytes.byteLength
    });
    if (!quotaResponse.ok) return quotaResponse;

    await env.TAKEAWAYS.put(chunkKey(id, index), bytes, {
        httpMetadata: { contentType: "image/webp" }
    });

    if (!manifest.uploadedChunks.includes(index)) {
        manifest.uploadedChunks.push(index);
        manifest.uploadedChunks.sort(function (a, b) { return a - b; });
        await saveManifest(env, id, manifest);
    }

    return json({ uploaded: index });
}

async function completeJourney(request, env, id) {
    if (!originIsAllowed(request, env)) {
        return json({ error: "This origin is not allowed." }, 403);
    }

    const manifest = await readActiveManifest(env, id);
    if (manifest instanceof Response) return manifest;

    if (manifest.status === "ready") {
        return json({ ready: true, expiresAt: manifest.expiresAt });
    }

    if (manifest.uploadedChunks.length !== manifest.chunkCount) {
        return json({ error: "Some fragments have not arrived yet." }, 409);
    }

    manifest.status = "ready";
    manifest.completedAt = new Date().toISOString();
    await saveManifest(env, id, manifest);

    return json({ ready: true, expiresAt: manifest.expiresAt });
}

async function getJourney(env, id) {
    const manifest = await readActiveManifest(env, id);
    if (manifest instanceof Response) return manifest;
    return json(manifest);
}

async function renderJourneyPage(env, id, origin) {
    const manifest = await readActiveManifest(env, id);

    if (manifest instanceof Response) {
        const status = manifest.status === 410 ? 410 : 404;
        return html(expiredPage(), status);
    }

    if (manifest.status !== "ready") {
        return html(preparingPage(), 202, { "Refresh": "3" });
    }

    const images = Array.from({ length: manifest.chunkCount }, function (_, index) {
        return `<img src="${escapeAttribute(`${origin}/j/${id}/chunks/${index}.webp`)}" alt="Waiting record, fragment ${index + 1}">`;
    }).join("");

    return html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your takeaway</title>
  <style>
    html, body { margin: 0; min-height: 100%; background: #f5e4c5; }
    main { width: min(100%, ${manifest.width}px); margin: 0 auto; overflow: hidden; }
    img { display: block; width: 100%; height: auto; }
    footer { padding: 24px 14px; color: #776444; font: 13px/1.5 "Courier New", monospace; text-align: center; }
  </style>
</head>
<body>
  <main>${images}</main>
  <footer>This takeaway will disappear one day after it was made.</footer>
</body>
</html>`);
}

async function getJourneyImage(env, id, index) {
    const manifest = await readActiveManifest(env, id);
    if (manifest instanceof Response) return manifest;

    if (manifest.status !== "ready" || index < 0 || index >= manifest.chunkCount) {
        return new Response("Not found.", { status: 404 });
    }

    const object = await env.TAKEAWAYS.get(chunkKey(id, index));
    if (!object) return new Response("Not found.", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(object.body, { headers });
}

async function readActiveManifest(env, id) {
    if (!isValidId(id)) return json({ error: "Not found." }, 404);

    const object = await env.TAKEAWAYS.get(manifestKey(id));
    if (!object) return json({ error: "Not found." }, 404);

    const manifest = JSON.parse(await object.text());
    if (Date.parse(manifest.expiresAt) <= Date.now()) {
        return json({ error: "This takeaway has expired." }, 410);
    }

    return manifest;
}

function saveManifest(env, id, manifest) {
    return env.TAKEAWAYS.put(manifestKey(id), JSON.stringify(manifest), {
        httpMetadata: { contentType: "application/json; charset=utf-8" }
    });
}

function manifestKey(id) {
    return `journeys/${id}/manifest.json`;
}

function chunkKey(id, index) {
    return `journeys/${id}/chunk-${index}.webp`;
}

function isValidId(id) {
    return /^[0-9a-f-]{36}$/i.test(id);
}

function originIsAllowed(request, env) {
    const origin = request.headers.get("Origin");
    return !origin || allowedOrigins(env).includes(origin);
}

function withCors(response, request, env) {
    const origin = request.headers.get("Origin");
    if (!origin || !allowedOrigins(env).includes(origin)) return response;

    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function handleOptions(request, env) {
    if (!originIsAllowed(request, env)) {
        return new Response(null, { status: 403 });
    }

    const origin = request.headers.get("Origin");

    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Takeaway-Client",
            "Access-Control-Max-Age": "86400",
            "Vary": "Origin"
        }
    });
}

function allowedOrigins(env) {
    return String(env.ALLOWED_ORIGINS || "")
        .split(",")
        .map(function (origin) { return origin.trim(); })
        .filter(Boolean);
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    });
}

function html(body, status = 200, extraHeaders = {}) {
    return new Response(body, {
        status,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders
        }
    });
}

function preparingPage() {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Preparing your takeaway</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5e4c5;color:#776444;font:14px/1.6 "Courier New",monospace;text-align:center}</style></head><body><p>Your takeaway is still being prepared.<br>This page will refresh by itself.</p></body></html>`;
}

function expiredPage() {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Takeaway expired</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5e4c5;color:#776444;font:14px/1.6 "Courier New",monospace;text-align:center}</style></head><body><p>This takeaway is no longer here.</p></body></html>`;
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

async function requestRateLimit(request, env) {
    if (!env.TAKEAWAY_RATE_LIMIT) return true;

    const actor = request.headers.get("X-Takeaway-Client") ||
        request.headers.get("cf-connecting-ip") ||
        "unknown";
    const result = await env.TAKEAWAY_RATE_LIMIT.limit({ key: actor });
    return result.success;
}

async function callQuota(env, path, body) {
    const quotaId = env.TAKEAWAY_QUOTA.idFromName("global");
    const quota = env.TAKEAWAY_QUOTA.get(quotaId);
    return quota.fetch(`https://quota.internal${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

export class TakeawayQuota {
    constructor(context, env) {
        this.context = context;
        this.env = env;
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (request.method !== "POST") {
            return json({ error: "Method not allowed." }, 405);
        }

        const input = await request.json();

        if (url.pathname === "/reserve-journey") {
            return this.reserveJourney(input);
        }

        if (url.pathname === "/reserve-bytes") {
            return this.reserveBytes(input);
        }

        return json({ error: "Not found." }, 404);
    }

    async reserveJourney(input) {
        const requiredWrites = input.chunkCount * 2 + 2;
        const usage = await this.currentUsage();

        if (usage.r2Writes + requiredWrites > DAILY_R2_WRITES) {
            return json({
                error: "Today’s takeaway limit has been reached. Please return tomorrow."
            }, 429);
        }

        const journeyKey = `journey:${input.id}`;
        const existingJourney = await this.context.storage.get(journeyKey);
        if (existingJourney) {
            return json({ error: "This journey already exists." }, 409);
        }

        usage.r2Writes += requiredWrites;
        await this.context.storage.put("daily-usage", usage);
        await this.context.storage.put(journeyKey, {
            bytes: 0,
            chunks: {},
            expiresAt: input.expiresAt
        });

        const expiresAt = Date.parse(input.expiresAt);
        const cleanupAt = Math.ceil(expiresAt / 3600000) * 3600000;
        await this.context.storage.put(
            `expiry:${String(cleanupAt).padStart(13, "0")}:${input.id}`,
            input.id
        );
        await this.scheduleCleanup(cleanupAt);

        return json({
            reserved: true,
            dailyUploadLimit: DAILY_UPLOAD_BYTES,
            journeyLimit: MAX_JOURNEY_BYTES
        });
    }

    async reserveBytes(input) {
        const journeyKey = `journey:${input.id}`;
        const journey = await this.context.storage.get(journeyKey);

        if (!journey) {
            return json({ error: "This takeaway reservation no longer exists." }, 404);
        }

        if (Date.parse(journey.expiresAt) <= Date.now()) {
            return json({ error: "This takeaway has expired." }, 410);
        }

        const chunkKey = String(input.index);
        if (Object.hasOwn(journey.chunks, chunkKey)) {
            if (journey.chunks[chunkKey] === input.bytes) {
                return json({ reserved: true, repeated: true });
            }

            return json({ error: "This fragment reservation does not match." }, 409);
        }

        if (journey.bytes + input.bytes > MAX_JOURNEY_BYTES) {
            return json({ error: "This takeaway is too large to store safely." }, 413);
        }

        const usage = await this.currentUsage();
        if (usage.uploadBytes + input.bytes > DAILY_UPLOAD_BYTES) {
            return json({
                error: "Today’s takeaway storage limit has been reached. Please return tomorrow."
            }, 429);
        }

        usage.uploadBytes += input.bytes;
        journey.bytes += input.bytes;
        journey.chunks[chunkKey] = input.bytes;

        await this.context.storage.put("daily-usage", usage);
        await this.context.storage.put(journeyKey, journey);

        return json({ reserved: true });
    }

    async currentUsage() {
        const day = new Date().toISOString().slice(0, 10);
        const stored = await this.context.storage.get("daily-usage");

        if (!stored || stored.day !== day) {
            return { day, uploadBytes: 0, r2Writes: 0 };
        }

        return stored;
    }

    async scheduleCleanup(expiresAt) {
        const currentAlarm = await this.context.storage.getAlarm();

        if (currentAlarm === null || expiresAt < currentAlarm) {
            await this.context.storage.setAlarm(expiresAt);
        }
    }

    async alarm() {
        const now = Date.now();
        let nextExpiration = null;
        let shouldContinue = true;

        while (shouldContinue) {
            const expirations = await this.context.storage.list({
                prefix: "expiry:",
                limit: 1000
            });
            let deletedInBatch = 0;

            for (const [key, journeyId] of expirations) {
                const expiresAt = Number(key.split(":")[1]);

                if (expiresAt <= now) {
                    await this.deleteJourney(journeyId);
                    await this.context.storage.delete(key);
                    await this.context.storage.delete(`journey:${journeyId}`);
                    deletedInBatch++;
                } else {
                    nextExpiration = expiresAt;
                    break;
                }
            }

            shouldContinue = expirations.size === 1000 && deletedInBatch === 1000;
        }

        if (nextExpiration !== null) {
            await this.context.storage.setAlarm(nextExpiration);
        }
    }

    async deleteJourney(journeyId) {
        let cursor;

        do {
            const page = await this.env.TAKEAWAYS.list({
                prefix: `journeys/${journeyId}/`,
                cursor
            });
            const keys = page.objects.map(function (object) { return object.key; });

            if (keys.length > 0) {
                await this.env.TAKEAWAYS.delete(keys);
            }

            cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);
    }
}
