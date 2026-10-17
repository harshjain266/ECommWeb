# Sanskar & Kabir — couture atelier storefront

A full-stack e-commerce site for an Indian fashion & design boutique: an
animated editorial storefront, a role-based admin console, and Razorpay
payments. Next.js 16 (App Router) · PostgreSQL via Prisma · Tailwind 4 ·
Framer Motion · Cloudinary.

---

## Quick start

```bash
npm install
cp .env.example .env          # then fill it in — see below
createdb sanskar_web          # or point DATABASE_URL at any Postgres
npm run db:push               # create the tables
npm run db:seed               # 35 categories, 22 products, banners, demo order
npm run media:warm            # pre-generate Cloudinary renditions (see note)
npm run dev
```

Open <http://localhost:3000>.

**Seeded logins**

| Role     | Email                         | Password       |
| -------- | ----------------------------- | -------------- |
| Admin    | `admin@sanskarandkabir.com`   | `Admin@12345`  |
| Customer | `aarohi@example.com`          | `Customer@123` |

The admin console is at `/admin`.

---

## Environment

```ini
DATABASE_URL="postgresql://USER@localhost/sanskar_web?host=/tmp&schema=public"
AUTH_SECRET="<openssl rand -base64 32>"        # must be ≥32 chars

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="ddlj4gono"
CLOUDINARY_API_KEY=""                           # only needed to UPLOAD
CLOUDINARY_API_SECRET=""

NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_…"
RAZORPAY_KEY_ID="rzp_test_…"
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
```

> **On `DATABASE_URL`**: the `?host=/tmp` form connects over the Unix socket.
> That was deliberate here — this machine had a Docker container also bound to
> port 5432, so `localhost` resolved to the wrong Postgres. On a normal host
> `postgresql://user:pass@localhost:5432/sanskar_web` is fine.

Everything degrades gracefully when keys are absent: the storefront, cart and
admin all work without Razorpay or Cloudinary credentials. Checkout returns a
clear "payments not configured" message, and the media library still browses
and attaches known assets.

**What the Cloudinary keys unlock** (`CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`):

| | Without keys | With keys |
| --- | --- | --- |
| Browse & attach existing assets | yes | yes |
| Delivery transforms (HEIC→WebP, MOV→mp4) | yes | yes |
| **Upload** new stills and clips | no | yes |
| **Enumerate** the live Cloudinary folder | no | yes |
| **Delete** an unused asset | no | yes |

The listing matters more than it sounds: without it the library can only show
assets it already knows about — the seeded manifest plus whatever is attached
to a product — so a freshly uploaded file would be invisible until it was used
somewhere. With keys, `listFolderAssets()` pages the Admin API for both image
and video resource types and merges them in, newest first, badged `uploaded`.

Uploads go to the folder named by `CLOUDINARY_UPLOAD_FOLDER` (default
`sanskar`). HEIC and `.mov` are accepted deliberately — the studio shoots on
iPhone and the delivery layer transcodes on the way out. Limit 100MB; a
listing failure degrades to the known-assets view rather than breaking the
picker.

Deleting is guarded: an asset still referenced by a product, banner or
category returns 409 with the list of what is using it, because Cloudinary
deletion cannot be undone.

---

## The media layer (read this one)

The studio's asset library is iPhone-native: stills are **HEIC** and clips are
**HEVC-in-QuickTime (`.mov`)**. **Neither plays in Chrome or Firefox.** Linking
those files directly would look broken for most visitors.

So nothing is ever linked raw. Every URL is built by `src/lib/media.ts`, which
forces a web-safe rendition at the Cloudinary delivery edge:

| Source        | Delivered as                              | Built by           |
| ------------- | ----------------------------------------- | ------------------ |
| `.heic` still | `f_auto` → AVIF / WebP / JPEG per browser | `imageUrl()`       |
| `.mov` clip   | `.mp4`, `vc_h264`, audio stripped         | `videoUrl()`       |
| `.mov` clip   | first frame as a JPEG poster              | `videoPosterUrl()` |
| either        | 24px blurred placeholder                  | `blurUrlFor()`     |

Two consequences worth knowing:

1. **Cloudinary builds each rendition lazily.** The first request for a
   transform it has never seen returns **HTTP 423** while it transcodes, then
   caches. On a cold deploy that means broken-looking video for the first
   visitor — which is what `npm run media:warm` prevents. Run it after seeding
   and after uploading new assets.
2. **Videos live under `/video/upload/`, not `/image/upload/`.** Asking for a
   clip's poster or blur under the image path is a 404. `blurUrlFor(id, kind)`
   exists for exactly this reason; prefer it over `blurUrl()`.

Stills are rendered with a plain `<img srcset>` rather than `next/image`, on
purpose: Next's optimizer cannot decode HEIC, while Cloudinary's `f_auto`
already negotiates the best format per browser. Clips are gated behind an
`IntersectionObserver` and have **no `src` until they near the viewport**, so a
page carrying a dozen of them fetches only what is actually seen.

---

## Payments

The flow is three steps, and the browser is not trusted at any of them.

1. **`POST /api/checkout/create`** — prices the order **from the server-side
   cart**, never from the request body, re-checks stock, writes a `PENDING`
   order, creates the matching Razorpay order and returns the handoff payload.
2. **`POST /api/checkout/verify`** — the checkout callback. The success payload
   is accepted only once its **HMAC signature verifies** against the key
   secret (`sha256(razorpay_order_id|razorpay_payment_id)`). Without that check
   anyone could POST a fabricated success and get a paid order. On success:
   order → `PAID`, payment → `CAPTURED`, stock decremented, cart emptied.
3. **`POST /api/webhooks/razorpay`** — the authoritative settlement path, for
   when the browser callback is lost (tab closed, network dropped). Signed with
   the *webhook* secret over the **raw request body**, so the handler reads
   `await req.text()` — parsing and re-serialising would change the bytes and
   break the signature.

Steps 2 and 3 are **idempotent**: whichever arrives first captures the payment,
and the second is a no-op, so stock is never decremented twice.

Amounts are integer **paise** end to end (`src/lib/money.ts`). Razorpay also
speaks paise, so nothing is ever rounded in transit.

**Webhook setup**: in the Razorpay dashboard point a webhook at
`<your-site>/api/webhooks/razorpay` and subscribe to `payment.captured`,
`payment.failed` and `refund.processed`. For local testing, tunnel it
(`ngrok http 3000`) — `localhost` is not reachable from Razorpay.

### Verified behaviour

The payment paths were exercised against self-signed payloads during the build:

- forged signature → `400`, payment marked `FAILED`, order left `PENDING`
- valid signature → order `PAID`, payment `CAPTURED`, stock `3 → 1` for qty 2
- replayed valid payload → idempotent, stock unchanged
- webhook with no / bad signature → `400`
- `refund.processed` → payment and order both `REFUNDED`

---

## Auth & roles

Sessions are signed JWTs (`jose`, HS256) in an **httpOnly, SameSite=Lax**
cookie; passwords are bcrypt at cost 12. Two roles: `CUSTOMER` and `ADMIN`.

Access is gated in two places, deliberately:

- **`src/middleware.ts`** — cheap edge check that a valid session exists and
  claims `ADMIN`. It cannot reach the database from the edge runtime.
- **`requireAdmin()` in `src/lib/auth.ts`** — the authoritative check, run on
  every admin render, which **re-reads the role from Postgres**. So revoking an
  admin takes effect immediately rather than when their 30-day token expires.

Admin API routes are wrapped in `withAdmin()` and return `403`, not a redirect.

Guard rails that are enforced server-side: self-registration is always
`CUSTOMER` (the role is never read from the request body); an admin cannot
remove their own access; the last remaining admin cannot be demoted.

---

## The navigation

Two levels, stored in the `Category` table. Top-level rows are the header
options; their children are the mega-menu sub-options, split into three
columns by `menuGroup`:

| `menuGroup` | Column heading       |
| ----------- | -------------------- |
| `OCCASION`  | Shop By Occasion     |
| `CATEGORY`  | Shop By Category     |
| `COLLECTION`| Shop By Collection   |

The header order is **New Collection · Men · Women · Occasion · Jewellery ·
Wishlist · About Us**. Wishlist and About Us are pages rather than shoppable
categories, so the header appends them as static links; everything else comes
from the database and is editable in `/admin/categories` with no deploy.

As seeded:

| Option         | Shop By Occasion | Shop By Category | Shop By Collection |
| -------------- | ---------------- | ---------------- | ------------------ |
| New Collection | — | Just In · Festive Edit · Ready To Ship | Sanghe FW/26 |
| Men | Haldi · Mehendi · Wedding/Pheras · Sangeet/Cocktail · Reception | Sherwanis · Bandhgalas · Kurta Sets · Tuxedos · Nehru Jackets · Indo-Western | Urli · Benaras Reverie |
| Women | Haldi · Mehendi · Wedding/Pheras · Sangeet/Cocktail · Reception | Lehengas + Gowns · Sarees · Anarkalis · Suit Sets · Kurta Sets · Indo-Western · Blouses & Corsets | Ivory Vows · Mughal Garden |
| Occasion | Haldi · Mehendi · Wedding/Pheras · Sangeet/Cocktail · Reception | Bridal Must-Haves · Groom Edits · Festive Vibe · Ceremony Edits | Noor Festive |
| Jewellery | — | Bridal Sets · Necklaces · Earrings · Maang Tikka · Bracelets & Kadas | Sanskar Gold |

A top-level collection page shows every product beneath it; a leaf shows its
own, with price filtering and sorting. `/collections/all` is the paginated
"view all designs" page.

---

## The homepage, scroll by scroll

1. **Hero** — the film carousel (left untouched, as asked).
2. **Statement + The Occasion Edit** — "Where individuality meets contemporary
   Indian craft", then three occasion panels (Carnival / Sangeet / Wedding),
   each with its own Explore button.
3. **Edit buttons** — Groom Edits · Festive Vibe · Ceremony Edits · View all
   designs.
4. **The film trio** — three clips side by side. The centre one is the feature
   and carries a **mute toggle**: autoplay is only permitted while muted, so
   the viewer opts into sound. The flanking clips are transcoded silent
   (`ac_none`) to save bandwidth.
5. **Signature pieces** — the featured grid.
6. **Diwali carousel** — arrow-driven, keyboard-navigable.
7. **Jewellery editorial**, craft stats, new arrivals.
8. **In their own words** — a continuously drifting testimonial rail that
   pauses on hover.
9. **The atelier**, then the appointment call to action.

Every image and video panel carries an **Explore** affordance, and a side
**chat widget** hands off to WhatsApp rather than faking a live agent.

---

## Admin console (`/admin`)

| Page          | What it does                                                                     |
| ------------- | -------------------------------------------------------------------------------- |
| Dashboard     | Revenue (captured only), orders, low stock, latest payments                      |
| **Catalogue** | **Per-category item management — the dynamic part. See below.**                  |
| All products  | Full CRUD across every category; drag-to-reorder gallery                         |
| Orders        | Filter by status, see payment refs, change fulfilment state                      |
| Payments      | Every Razorpay transaction with provider ids, for reconciliation                 |
| Media library | Browse / upload / preview every asset, with "used by" tracking                   |
| Banners       | Hero carousel, editorial panels and the Diwali carousel                          |
| Navigation    | The two-level menu, with up/down reordering                                      |
| Customers     | Lifetime value, and promote / demote administrators                              |

### The Catalogue screen

Pick a category on the left — the full tree, e.g. **Men → Sherwanis** — and
manage its pieces on the right:

- **Reorder** (aage / peeche) with up-down arrows. The storefront follows this
  order exactly. Reordering sends the **whole ordered list of ids** rather than
  a swap, so the server writes `position = index`: idempotent, and it cannot
  drift out of step if two edits race.
- **Stock**, edited inline per size and saved on blur.
- **Add or remove a size** on any piece.
- **Add a piece** straight into the category. It is created *hidden* with a
  placeholder description — a quick-add is a stub, not a listing — and you land
  in the full editor to finish it.
- **Move a piece** to a different category from a dropdown.
- **Hide / publish**, and a link through to the full editor.

Categories themselves reorder the same way in `/admin/categories`.

Two behaviours that protect history:

- Deleting a product that appears in any order **deactivates** it instead, so
  order lines keep their link. `?hard=1` forces a real delete when nothing
  references it.
- A size that appears in an order line **cannot be deleted** — the API returns
  409 and tells you to set its stock to 0 instead.
- Moving a paid order to `CANCELLED` or `REFUNDED` **returns its stock**,
  guarded so repeated saves cannot credit stock twice.

---

## Project layout

```
prisma/
  schema.prisma          13 models; money in paise; order lines snapshotted
  seed.ts                nav tree + catalogue + banners + a demo paid order
scripts/
  warm-media.ts          pre-generates every Cloudinary rendition
src/
  app/
    (auth)/              login · register
    (content)/[page]/    9 editorial pages, driven by lib/content.ts
    admin/               the console (incl. catalogue/ — per-category items)
    api/                 auth · cart · checkout · webhooks · admin
    collections/[slug]/  category listing, filter + sort
    product/[slug]/      gallery, sizes, add-to-bag, JSON-LD
    about/               About the House · Our Founders · Our Philosophy
    wishlist/            saved pieces (account-backed)
    collections/all/     paginated "view all designs"
    cart · checkout · order/[id] · account · search · atelier
  components/
    admin/               shell, forms, MediaPicker, managers
    product/             card, grid, gallery, add-to-cart, toolbar
    site/                header + mega-menu, hero, footer, editorial blocks
    ui/                  CldImage, CldVideo, Reveal, Toast, StatusPill
  lib/
    nav.ts / nav-shared.ts  ← menu tree; shared half is client-safe
    about.ts · content.ts   ← editorial copy
    media.ts             ← the Cloudinary URL builder
    razorpay.ts          ← signature verification
    cart.ts · auth.ts · session.ts · money.ts · validators.ts · nav.ts
  middleware.ts          edge gate for /admin and /account
```

---

## Scripts

| Command              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Dev server                                   |
| `npm run build`      | `prisma generate` + production build         |
| `npm run typecheck`  | `tsc --noEmit`                               |
| `npm run db:push`    | Sync the schema                              |
| `npm run db:seed`    | Reseed (destructive — truncates first)       |
| `npm run db:reset`   | Force-reset the schema and reseed            |
| `npm run db:studio`  | Prisma Studio                                |
| `npm run media:warm` | Pre-generate Cloudinary renditions           |

---

## Design system

Beige ground, chocolate-brown type. The palette lives entirely in CSS custom
properties at the top of `src/app/globals.css` — the tokens are still named
`ink` (chocolate) and `bone` (beige) so the whole site re-skins from one block
without touching a class name anywhere:

```css
--color-ink:  #3e2516;   /* chocolate — headings, dark panels, body copy */
--color-bone: #f5ede1;   /* beige — the page ground */
--color-gold: #a9834b;   /* accents, eyebrows, active states */
--color-oxblood: #7a2116;/* the customisation call to action only */
```

Type is Cormorant Garamond (display) over Jost (sans), both self-hosted
variable woff2, latin subset.

---

## Notes, limits, and what to do next

- **Dependency versions are pinned exactly**, not ranged. npm in this
  environment resolved caret ranges to the newest majors (Prisma 7, Tailwind 4,
  lucide 1.x), which broke things mid-build. Exact pins keep installs
  reproducible; upgrade deliberately.
- **Prisma is held at 6.16.** Prisma 7 moves the datasource URL out of the
  schema into `prisma.config.ts` and requires a driver adapter — a worthwhile
  migration, but not one to take on by accident.
- **Fonts are self-hosted** (`src/app/fonts/*.woff2`, latin subset, variable).
  `next/font/google` failed to resolve its font files under Next 16's
  Turbopack; self-hosting also removes a third-party request from the critical
  path.
- **`lucide-react` v1 dropped brand icons**, so the Instagram glyph in the
  footer is inlined SVG.
- **Newsletter and appointment forms validate and acknowledge but do not
  persist.** Both are deliberate stubs — a mailing list belongs in an ESP
  (Mailchimp / Klaviyo / Brevo) and a bridal consultation belongs in the
  atelier's inbox or CRM. Drop the provider call into
  `src/app/api/newsletter/route.ts` and `src/app/api/appointments/route.ts`;
  the forms already post the right shape.
- **No automated test suite.** The flows in this README were verified by
  driving the running server (HTTP status, DB state, signed payloads). A real
  deployment wants that encoded as tests — the payment verify/webhook paths
  first, since they are the ones that must not regress.
- **Order emails are not sent.** `order.email` is captured and the confirmation
  page is live; wiring a transactional provider is the next obvious step.
- **Before going live**: set a fresh `AUTH_SECRET`, change the seeded admin
  password, swap `rzp_test_` keys for live ones, set `NEXT_PUBLIC_SITE_URL`,
  and register the production webhook.
