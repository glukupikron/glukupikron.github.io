# Takeaway capture plan

## Goal

When the player selects `Done?` and then `Yes`, create a QR-linked record of everything they actually reached during the journey.

- Capture the document only down to the furthest point that entered the viewport.
- Capture visual material outside `.eventArea`, including scattered words, drawings, and ash.
- Exclude the fixed cigarette UI itself.
- Keep `.ashTrace` in the result.
- Support desktop and mobile without creating one dangerously large canvas.

## Recommended flow

1. Track the furthest visible document position with `scrollY + innerHeight`.
2. On `Yes`, freeze that boundary and stop scrolling, timers, and new event creation.
3. Create an empty journey on the server and receive an unguessable journey URL.
4. Show a QR code for that URL immediately.
5. Capture `document.body` from the top to the frozen boundary in vertical chunks.
6. Convert and upload one chunk at a time.
7. Finalize the journey manifest after all chunks have uploaded.
8. The QR landing page stacks the chunks without gaps so they appear as one continuous record.

## Capture inclusion rules

Add `data-capture-ignore` to UI that should not appear in the result:

- `.tabakoImage`
- `.owariButton`
- `.owariModal`
- QR, progress, and error UI

Do not add it to `.ashTrace`. Ash is appended directly to `document.body` and should remain visible in the capture.

Hidden templates such as `#eventSources` will not render and do not need special handling.

## Suggested client structure

Keep the work divided into small functions:

```text
trackSeenBottom()
prepareTakeaway()
createTakeawaySession()
captureJourneyChunks()
uploadJourneyChunk()
completeTakeaway()
showTakeawayResult()
```

Suggested state:

```javascript
const takeawayState = {
    status: "playing",
    seenBottom: window.innerHeight,
    journeyId: null,
    shareUrl: null
};
```

## Performance defaults

- Desktop chunk height: `4000px`
- Mobile chunk height: `2000px`
- Capture scale: `1`
- Output: WebP around quality `0.9`
- Upload concurrency: one chunk on mobile; at most two on desktop
- Use `canvas.toBlob()`, not `canvas.toDataURL()`
- Upload and release each canvas before rendering the next chunk
- Do not stitch chunks into one huge image on the server
- Wait only for fonts and images inside the frozen capture range
- Retry individual failed chunks instead of restarting the whole capture

## Free-tier guardrails

- Global daily upload reservation: `2 GB`
- Global daily R2 write reservation: `20,000`
- Maximum per takeaway: `100 MB` and `40` fragments
- Anonymous-browser request limit: `600` requests per minute
- Exact counters: one SQLite Durable Object shared by all visitors
- Exact link expiry: 24 hours
- Direct deletion: scheduled within the hour after expiry
- Backup deletion: R2 one-day lifecycle rule

The quota is enforced in the Worker, not trusted to browser JavaScript. Direct API requests therefore pass through the same limits.

The result page uses a manifest listing the chunks in order. Storage validates file type and size, uses an unguessable ID, and restricts CORS to the project site. The Worker rejects the link exactly 24 hours after creation, and the one-day R2 lifecycle rule handles physical cleanup afterward.

## Server shape

```text
POST /api/journeys
PUT  /api/journeys/:id/chunks/:index
POST /api/journeys/:id/complete
GET  /j/:id
```

Example stored result:

```text
journey-id/
├── chunk-1.webp
├── chunk-2.webp
├── chunk-3.webp
└── manifest.json
```

GitHub Pages cannot receive uploads by itself, so this stage requires a separate serverless endpoint and object storage.

## Player-facing copy

Confirmation:

> Has the one you’ve been waiting for arrived?  
> Take the traces of your waiting with you.  
> Your takeaway will remain for one day.

Buttons:

```text
Yes
Not yet
```

Initial preparation:

> Preparing your takeaway…

QR visible while uploading:

> Your takeaway is being prepared.  
> You may scan the code now. Please keep this page open until it is complete.

Progress:

```text
Saving fragment 3 of 8…
```

Complete:

> Your record of waiting is ready.  
> It will remain available for one day.

Buttons:

```text
Open
Copy link
Close
```

Failure:

> Something interrupted the process. Your journey is still here.

Button:

```text
Try again
```

On mobile, always provide `Open` alongside the QR because the player cannot conveniently scan a QR displayed on the same device.

## Implemented structure

1. The client tracks and freezes the furthest visible point.
2. It captures `document.body` in 4000px desktop or 2000px mobile fragments.
3. `.tabakoImage`, the Done button, and modal UI are excluded; `.ashTrace` remains.
4. Each WebP fragment is uploaded sequentially with up to three attempts.
5. The modal displays upload progress, a QR code, Open, Copy link, and Close.
6. The Worker stores a manifest and fragments in R2 and serves them as one continuous page.
7. The manifest becomes inaccessible exactly after 24 hours; the R2 one-day lifecycle removes the objects afterward.
