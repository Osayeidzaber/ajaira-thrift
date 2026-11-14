# Ajaira Thrift — veyroze.com 1:1 Replica Design

Date: 2026-11-14
Status: Approved (design) — pending spec review
Base: Shopify Dawn v15.4.0 + Vue 3 + TypeScript (Vite islands)
Store: kdbp9c-pv.myshopify.com · Repo: https://github.com/Osayeidzaber/ajaira-thrift

## 1. Goal & scope

Replicate the design/UX of https://www.veyroze.com pixel-for-pixel ("1:1, NO DIFFERENT")
as a **proper, fully editor-driven Shopify theme** for the Ajaira Thrift brand.

- Copy covers **design/UX only**. Brand, products, and content are Ajaira's own.
- **Nothing hard-coded.** All copy/images/links = section/block settings or `locales`;
  colors/fonts/spacing = `config/settings_schema.json`; navigation = linklists;
  thrift specs = product metafields; products/collections = Shopify objects.
- Vue + TypeScript are used as progressive-enhancement islands compiled into `assets/`,
  never as a headless SPA (theme editor must remain authoritative).

Reference material (HTML, CSS, full-page screenshots) lives in `reference/veyroze/`.

## 2. Source-site facts (research)

- Platform: Shopify. Theme "Veyroze Prime" = **Dawn 15.4.0** (theme_store_id 887).
- Custom sections (prefix `ant_`/`veyroze_`): announcement bar, header, image banner,
  trust badges, collections carousel, product-launch x2, FAQ, inner-circle, footer x2.
- Apps on source (not required to replicate as apps): Judge.me reviews, Orbe geolocation
  (multi-currency/language), returns app, Shop Pay. Shop Pay = native dynamic checkout.
- Pages: home; collection (category tabs + filter/sort drawer + pagination); product
  (thrift spec panel, measurements, condition scale, shipping timeline); static pages
  (contact, size-chart, condition, kategorien, klarna); cart.

### Design tokens (sampled from source; become theme settings)

| Token | Value | Role |
|---|---|---|
| bg | #0b0b0d | page background |
| panel | #141417 | cards/panels |
| ink | #f4f2ee | primary text |
| mute | #8a8a93 | secondary text |
| faint | #56565e | tertiary text |
| line | #2a2a30 | borders |
| line-soft | #202026 | subtle borders |
| wine | #7a1320 | accent |
| wine-bright | #9b2230 | accent hover |
| ok | #3f5e44 | success/condition |
| cta | #d4b26e | primary button (gold) |
| cta-hover | #c8a45c | button hover |

Fonts: heading **Baskervville** (serif), body **Assistant** (sans) — via `font_picker`.
WhatsApp green #108474 is a fixed brand color (icon), not a theme token.

## 3. Foundation & tooling

- Re-base working tree to Dawn `v15.4.0` (tag `3050c35`). Keep `reference/`, `docs/`.
- Add `package.json`, `tsconfig.json`, `vite.config.ts`, `src/`.
- Build: Vite (Vue 3 + TS) compiles `src/islands/*` → `assets/island-*.js` (+ extracted CSS).
- Dev: `shopify theme dev --store <store>` (Liquid hot reload) + `vite build --watch`.
- Quality gates: `shopify theme check`, `vue-tsc --noEmit`, `vite build`.

## 4. Global settings (`config/settings_schema.json`)

Groups: Colors (all tokens above), Typography (heading/body font_picker + scale),
Layout (container width, section spacing, radius), Buttons (style), Social (links),
Cart (drawer toggle), Localization (currency/language selectors).
Emitted as CSS custom properties in `layout/theme.liquid` via a `css-variables` snippet.

## 5. Layout & global sections

- `layout/theme.liquid`: `content_for_header`, `content_for_layout`, header/footer groups.
- `sections/announcement-bar.liquid`: text, link, enabled toggle.
- `sections/header.liquid`: logo (image_picker/text), menu (linklist), sticky toggle,
  search/account/cart icons, localization forms.
- `sections/footer.liquid`: menu linklists, social links, payment-icons toggle, legal links.
- `sections/inner-circle.liquid`: WhatsApp card (link, label) + newsletter (form) blocks.

## 6. Home sections (schema-driven)

- `image-banner`: image, heading, sub, CTA label/link, height, overlay.
- `trust-badges`: repeatable blocks (icon + text).
- `collections-carousel`: collection_list, card style, autoplay; Vue carousel island.
- `product-launch`: product picker, eyebrow, description, feature blocks, CTA, show price;
  Vue gallery island. Used twice.
- `faq`: accordion blocks (question/answer) using native `<details>`.

## 7. Collection template

- Category tabs (collection_list), product grid, `product-card` snippet
  (image, title, price, sold-out badge, condition chip).
- `filter-drawer` Vue island using Shopify storefront filtering (Size/Availability/Sort).
- Sort select + pagination (`paginate`).

## 8. Product template (thrift core)

- Gallery Vue island (thumbs + arrows).
- Spec panel: metafields `model`, `fits_like`, `tag_size`, `condition`, `details`.
- Measurements: metafields `waist_cm`, `length_cm`, `leg_opening_cm` + diagram snippet.
- Condition scale: metafield `condition` mapped onto Worn→Very good→Like new.
- Shipping timeline: settings for dispatch/delivery windows.
- Add-to-cart (`form 'product'`) + dynamic checkout (Shop Pay). Trust row blocks.
- Recommendations ("You may also like").

### Metafield definitions (namespace `thrift`, type product)

| Key | Type | Example |
|---|---|---|
| model | single_line_text | 512 Bootcut |
| fits_like | single_line_text | W36/L34 |
| tag_size | single_line_text | W36/L32 |
| condition | single_line_text (enum: worn, good, very_good, like_new) | very_good |
| details | single_line_text | Cool wash |
| waist_cm | number_decimal | 46.5 |
| length_cm | number_decimal | 111 |
| leg_opening_cm | number_decimal | 24 |

Definitions created via admin/CLI; theme reads `product.metafields.thrift.*`.

## 9. Vue + TypeScript island contract

- `src/islands/<name>.vue` + `src/mount.ts`; mount on `[data-island="<name>"]`.
- Props from a Liquid-rendered `<script type="application/json">` (settings + metafields).
  Islands never hard-code data; they read props, so the editor stays in control.
- Islands: `carousel`, `gallery`, `filter-drawer`, `cart-drawer`, `condition-scale`.
- Shared `src/types.ts` (Product, Metafields, Cart) + `src/cart.ts` (Shopify AJAX API).
- Progressive enhancement: Liquid renders full markup; add-to-cart & accordion work
  without JS; islands enhance (drag, transitions, live filtering).

## 10. Data flow & editability

Liquid objects (product/collection/cart/settings/linklists) → JSON props → Vue.
Copy/images/links = settings/locales; nav = linklists; design = settings; specs = metafields.
No hard-coded strings, products, or URLs.

## 11. Error handling

- Island mount failure → native fallback remains usable (forms, `<details>`).
- Missing metafield → hide that spec row (Liquid guard), never render empty/`nil`.
- Cart AJAX error → surface message, keep native form fallback.

## 12. Testing & the 1:1 bar

- `shopify theme check`, `vue-tsc --noEmit`, `vite build` all pass.
- Preview via `shopify theme dev`; compare each page against `reference/veyroze/`
  screenshots (desktop + mobile) for layout, spacing, type, color parity.
- Verify editor: change a setting/metafield/menu and confirm the storefront updates
  (proves nothing is hard-coded).