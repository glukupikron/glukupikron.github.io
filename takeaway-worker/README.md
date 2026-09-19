# Takeaway Worker

This Worker receives the captured fragments, stores them in Cloudflare R2, and serves the QR destination page.

## First deployment

1. Install the Worker dependency:

   ```powershell
   cd takeaway-worker
   npm install
   ```

2. Sign in to Cloudflare:

   ```powershell
   npx wrangler login
   ```

3. Create the R2 bucket:

   ```powershell
   npx wrangler r2 bucket create waiting-takeaways
   ```

4. Delete stored objects after one day:

   ```powershell
   npx wrangler r2 bucket lifecycle add waiting-takeaways delete-after-one-day journeys/ --expire-days 1
   ```

5. Deploy:

   ```powershell
   npm run deploy
   ```

6. The deployed Worker currently uses `https://waiting-takeaway.lucia1007.workers.dev`.

The public site already points its requests to that address in `takeaway-config.js`. The Worker accepts browser uploads only from `https://waitingfor.website` and its GitHub Pages fallback domain. A `takeaway.waitingfor.website` custom domain can be added later, but it is not required.

The application checks each manifest’s exact timestamp, so a link stops working exactly 24 hours after creation. The R2 lifecycle rule then removes the stored objects automatically; Cloudflare notes that physical lifecycle deletion can be processed after the expiration time.

## Free-tier safety limits

The Worker rejects new work before this site can approach the R2 monthly free allowance:

- At most `2 GB` of new takeaway images per UTC day.
- At most `20,000` reserved R2 writes per UTC day.
- At most `100 MB` and `40` fragments per takeaway.
- At most `600` requests per anonymous browser per minute.
- One global SQLite Durable Object serializes quota updates, so simultaneous visitors share the same counters.
- The Worker makes a takeaway inaccessible at exactly 24 hours and schedules direct R2 deletion within the following hour. The bucket lifecycle rule remains as a backup.

These caps are intentionally below R2’s monthly free tier. On the Workers Free plan, Workers and SQLite Durable Objects also stop accepting operations after their own free daily limits rather than creating Workers overage charges. Do not upgrade this Worker to a paid Workers plan unless that behavior is intentionally changed.

The constants are at the top of `src/index.js`. Lowering them is safe; raising them requires recalculating the R2 monthly usage ceiling.
