# Ajaira Thrift (veyroze 1:1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully editor-driven Shopify theme that replicates veyroze.com's design 1:1 for the Ajaira Thrift brand.

**Architecture:** Dawn v15.4.0 base; custom sections/blocks with schemas; design tokens in settings; thrift specs in product metafields; Vue 3 + TypeScript islands compiled by Vite into `assets/`, hydrated from Liquid-rendered JSON props (progressive enhancement).

**Tech Stack:** Shopify Liquid (Dawn 15.4.0), Shopify CLI, Vue 3, TypeScript, Vite, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-14-veyroze-replica-design.md`

## Global Constraints

- Base theme: Dawn `v15.4.0` (tag `3050c35`). Nothing hard-coded: copy/images/links = settings or `locales`; nav = linklists; design = `settings_schema.json`; thrift specs = metafields namespace `thrift`.
- Colors (verbatim): bg `#0b0b0d`, panel `#141417`, ink `#f4f2ee`, mute `#8a8a93`, faint `#56565e`, line `#2a2a30`, line-soft `#202026`, wine `#7a1320`, wine-bright `#9b2230`, ok `#3f5e44`, cta `#d4b26e`, cta-hover `#c8a45c`.
- Fonts: heading `Baskervville`, body `Assistant` (font_picker).
- Metafields (namespace `thrift`): `model`, `fits_like`, `tag_size`, `condition` (enum worn/good/very_good/like_new), `details`, `waist_cm`, `length_cm`, `leg_opening_cm`.
- Gates every task: `shopify theme check`, `vue-tsc --noEmit`, `vite build` pass; preview via `shopify theme dev`.
- Visual CSS is ported from `reference/veyroze/base.css` and the source compiled styles; reference screenshots in `reference/veyroze/` are the 1:1 bar.
- All user-facing text via `{{ 'key' | t }}`; add keys to `locales/en.default.json`.

## File Structure

- `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts` — tooling.
- `src/types.ts`, `src/cart.ts`, `src/mount.ts`, `src/islands/index.ts` — TS core.
- `src/islands/{carousel,gallery,filter-drawer,cart-drawer,condition-scale}.vue` — islands.
- `src/__tests__/cart.test.ts` — cart unit tests.
- `snippets/css-variables.liquid`, `snippets/island-props.liquid`, `snippets/product-card.liquid`, `snippets/price.liquid`.
- `sections/{announcement-bar,header,footer,inner-circle,image-banner,trust-badges,collections-carousel,product-launch,faq}.liquid`.
- `sections/{main-collection,main-product}.liquid` (replace Dawn mains), `blocks/*` for repeatable items.
- `config/settings_schema.json`, `config/settings_data.json`, `locales/en.default.json`.
- `templates/*.json` wiring sections.

---

### Task 1: Re-base to Dawn 15.4.0 + tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `src/env.d.ts`
- Modify: repo theme dirs (replace skeleton with Dawn), `.gitignore`

**Interfaces:**
- Produces: npm scripts `build`, `watch`, `test`, `typecheck`; Vite emits `assets/island-*.js`.

- [ ] **Step 1: Fetch Dawn v15.4.0 over the skeleton tree (keep reference/, docs/).**

```bash
git remote add dawn https://github.com/Shopify/dawn.git
git fetch dawn tag v15.4.0 --no-tags
git checkout v15.4.0 -- assets blocks config layout locales sections snippets templates
```

- [ ] **Step 2: Add package.json.**

```json
{
  "name": "ajaira-thrift",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "watch": "vite build --watch",
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": { "vue": "^3.5.0" },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "vue-tsc": "^2.1.0"
  }
}
```

- [ ] **Step 3: Add vite.config.ts (multi-entry islands → assets/).**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: { islands: resolve(__dirname, 'src/mount.ts') },
      output: { entryFileNames: 'islands.js', assetFileNames: 'islands.[ext]' },
    },
  },
})
```

- [ ] **Step 4: Add tsconfig.json + src/env.d.ts + vitest.config.ts.**

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "strict": true, "jsx": "preserve", "lib": ["ES2022", "DOM"],
    "types": ["vite/client"], "skipLibCheck": true, "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

```ts
// src/env.d.ts
declare module '*.vue' { import type { DefineComponent } from 'vue'; const c: DefineComponent<{}, {}, any>; export default c }
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node' } })
```

- [ ] **Step 5: Install and verify baseline gates.**

Run: `npm install && npm run build && npm run typecheck && shopify theme check`
Expected: build/typecheck pass; theme check reports only pre-existing Dawn warnings.

- [ ] **Step 6: Commit.** `git add -A && git commit -m "chore: rebase to Dawn 15.4.0 + Vite/Vue/TS tooling"`

---

### Task 2: TS core — types + cart service (TDD)

**Files:**
- Create: `src/types.ts`, `src/cart.ts`, `src/__tests__/cart.test.ts`

**Interfaces:**
- Produces: `ThriftMetafields`, `CartLine`, `CartState`; `getCart(): Promise<CartState>`, `addToCart(id:number, qty?:number): Promise<CartState>`, `changeLine(key:string, qty:number): Promise<CartState>`, `formatMoney(cents:number, format:string): string`.

- [ ] **Step 1: Write src/types.ts.**

```ts
export interface ThriftMetafields {
  model?: string; fits_like?: string; tag_size?: string;
  condition?: 'worn' | 'good' | 'very_good' | 'like_new'; details?: string;
  waist_cm?: number; length_cm?: number; leg_opening_cm?: number;
}
export interface CartLine { key: string; id: number; title: string; quantity: number; final_line_price: number; image?: string; url: string }
export interface CartState { item_count: number; total_price: number; items: CartLine[] }
```

- [ ] **Step 2: Write failing test src/__tests__/cart.test.ts.**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addToCart, formatMoney } from '../cart'

beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })

describe('addToCart', () => {
  it('POSTs to /cart/add.js and returns cart', async () => {
    const cart = { item_count: 1, total_price: 12990, items: [] }
    ;(fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => cart })
    const res = await addToCart(42, 1)
    expect(fetch).toHaveBeenNthCalledWith(1, '/cart/add.js', expect.objectContaining({ method: 'POST' }))
    expect(res.item_count).toBe(1)
  })
  it('throws on non-ok response', async () => {
    ;(fetch as any).mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({ description: 'sold out' }) })
    await expect(addToCart(42)).rejects.toThrow('sold out')
  })
})

describe('formatMoney', () => {
  it('formats cents with a money format', () => {
    expect(formatMoney(12990, '€{{amount}}')).toBe('€129.90')
  })
})
```

- [ ] **Step 3: Run to verify it fails.** `npm run test` → FAIL (module '../cart' not found).

- [ ] **Step 4: Implement src/cart.ts.**

```ts
import type { CartState } from './types'

async function json(res: Response) {
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.description ?? `Cart error ${res.status}`) }
  return res.json()
}
export async function getCart(): Promise<CartState> { return json(await fetch('/cart.js')) }
export async function addToCart(id: number, quantity = 1): Promise<CartState> {
  await json(await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, quantity }) }))
  return getCart()
}
export async function changeLine(key: string, quantity: number): Promise<CartState> {
  return json(await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity }) }))
}
export function formatMoney(cents: number, format: string): string {
  const amount = (cents / 100).toFixed(2)
  return format.replace(/\{\{\s*amount\s*\}\}/, amount)
}
```

- [ ] **Step 5: Run to verify pass.** `npm run test` → PASS. `npm run typecheck` → pass.
- [ ] **Step 6: Commit.** `git add src && git commit -m "feat: typed cart service over Shopify AJAX API"`

---

### Task 3: Island mount + props contract

**Files:**
- Create: `src/mount.ts`, `src/islands/index.ts`, `snippets/island-props.liquid`

**Interfaces:**
- Consumes: island components (Tasks 5,7,8,9). Produces: `mountIslands()`; Liquid snippet `island-props` emits `<script type="application/json" data-island-props="{{ id }}">`.
- Contract: section root `<div data-island="NAME" data-island-id="ID">fallback</div>` + `{% render 'island-props', id: ID, props: obj %}`. Vue replaces fallback on mount; without JS fallback remains.

- [ ] **Step 1: Write snippets/island-props.liquid.**

```liquid
{% doc %}
  Emits JSON props for a Vue island.
  @param {string} id - island instance id
  @param {object} props - serializable props
{% enddoc %}
<script type="application/json" data-island-props="{{ id }}">{{ props | json }}</script>
```

- [ ] **Step 2: Write src/islands/index.ts (registry; components added in later tasks).**

```ts
import type { Component } from 'vue'
export const islands: Record<string, () => Promise<{ default: Component }>> = {}
```

- [ ] **Step 3: Write src/mount.ts.**

```ts
import { createApp } from 'vue'
import { islands } from './islands'

export async function mountIslands(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>('[data-island]')
  for (const el of Array.from(nodes)) {
    const name = el.dataset.island!
    const id = el.dataset.islandId!
    const loader = islands[name]
    if (!loader) continue
    const script = document.querySelector(`[data-island-props="${id}"]`)
    const props = script ? JSON.parse(script.textContent ?? '{}') : {}
    const { default: component } = await loader()
    createApp(component, props).mount(el)
  }
}
if (typeof document !== 'undefined') mountIslands()
```

- [ ] **Step 4: Build + typecheck.** `npm run build && npm run typecheck` → pass (assets/islands.js emitted).
- [ ] **Step 5: Commit.** `git add src snippets && git commit -m "feat: island mount + JSON props contract"`

---

### Task 4: Design tokens, settings, css-variables, layout wiring

**Files:**
- Modify: `config/settings_schema.json`, `layout/theme.liquid`
- Create: `snippets/css-variables.liquid`

**Interfaces:**
- Produces: CSS vars `--color-bg`, `--color-ink`, `--color-cta`, `--font-heading`, `--font-body`, etc., consumed by all section CSS.

- [ ] **Step 1: Add settings groups (Colors/Typography/Layout) to settings_schema.json** with ids `color_bg`, `color_panel`, `color_ink`, `color_mute`, `color_faint`, `color_line`, `color_line_soft`, `color_wine`, `color_wine_bright`, `color_ok`, `color_cta`, `color_cta_hover` (type color, defaults = Global Constraints values), `font_heading` (font_picker default baskervville_n4), `font_body` (font_picker default assistant_n4), `container_width` (range default 1200), `section_spacing` (range default 64), `radius` (range default 4).

- [ ] **Step 2: Write snippets/css-variables.liquid.**

```liquid
{% doc %}Emits theme design tokens as CSS variables.{% enddoc %}
<style>
  :root {
    --color-bg: {{ settings.color_bg }};
    --color-panel: {{ settings.color_panel }};
    --color-ink: {{ settings.color_ink }};
    --color-mute: {{ settings.color_mute }};
    --color-faint: {{ settings.color_faint }};
    --color-line: {{ settings.color_line }};
    --color-line-soft: {{ settings.color_line_soft }};
    --color-wine: {{ settings.color_wine }};
    --color-wine-bright: {{ settings.color_wine_bright }};
    --color-ok: {{ settings.color_ok }};
    --color-cta: {{ settings.color_cta }};
    --color-cta-hover: {{ settings.color_cta_hover }};
    --font-heading: {{ settings.font_heading.family }}, {{ settings.font_heading.fallback_families }};
    --font-body: {{ settings.font_body.family }}, {{ settings.font_body.fallback_families }};
    --container: {{ settings.container_width }}px;
    --spacing: {{ settings.section_spacing }}px;
    --radius: {{ settings.radius }}px;
  }
  body { background: var(--color-bg); color: var(--color-ink); font-family: var(--font-body); }
  h1,h2,h3,h4 { font-family: var(--font-heading); }
</style>
{{ settings.font_heading | font_face }}
{{ settings.font_body | font_face }}
```

- [ ] **Step 3: Render in theme.liquid `<head>`:** `{% render 'css-variables' %}` and load islands: `<script src="{{ 'islands.js' | asset_url }}" defer></script>`.
- [ ] **Step 4: theme check + preview.** `shopify theme check`; `shopify theme dev` confirm dark bg + fonts.
- [ ] **Step 5: Commit.** `git add config layout snippets && git commit -m "feat: editor-driven design tokens"`

---

### Task 5: Carousel + gallery islands

**Files:**
- Create: `src/islands/carousel.vue`, `src/islands/gallery.vue`
- Modify: `src/islands/index.ts`

**Interfaces:**
- Consumes: mount contract. Produces: islands `carousel` (props: `slides: {image,alt,url,label}[]`, `autoplay:boolean`), `gallery` (props: `images:{src,alt}[]`).

- [ ] **Step 1: Write carousel.vue** (scroll-snap track + prev/next + dots; props-driven; no hard-coded slides). Use `<div class="carousel"><div class="track" ref>` with `v-for` slides, buttons call `scrollBy`. CSS ported from `reference/veyroze` `.carousel`/compiled carousels styles.
- [ ] **Step 2: Write gallery.vue** (main image + thumbs + arrows; `active` index state; props.images).
- [ ] **Step 3: Register in index.ts:**

```ts
export const islands = {
  carousel: () => import('./carousel.vue'),
  gallery: () => import('./gallery.vue'),
}
```

- [ ] **Step 4: Build + typecheck.** `npm run build && npm run typecheck` → pass.
- [ ] **Step 5: Commit.** `git add src && git commit -m "feat: carousel + gallery islands"`

---

### Task 6: Global sections (announcement, header, footer, inner-circle)

**Files:**
- Create/modify: `sections/announcement-bar.liquid`, `sections/header.liquid`, `sections/footer.liquid`, `sections/inner-circle.liquid`; header/footer group JSON.

**Interfaces:**
- Consumes: css-variables, linklists, locales. Produces: global frame used by all templates.

- [ ] **Step 1: announcement-bar.liquid** — settings: `text` (inline_richtext), `link` (url), `enabled` (checkbox). Markup: `<div class="announcement">{{ section.settings.text }}</div>`; schema with presets. CSS: bg `--color-bg`, centered, small.
- [ ] **Step 2: header.liquid** — settings: `logo` (image_picker), `logo_text` (text), `menu` (link_list), `sticky` (checkbox). Render logo, `{% for link in section.settings.menu.links %}`, search/account/cart icons, localization form. Port Dawn header CSS + reference header styles.
- [ ] **Step 3: footer.liquid** — settings: `menu_1`,`menu_2` (link_list), `show_payment` (checkbox), social urls. Render linklists + payment icons `{{ shop.enabled_payment_types }}`.
- [ ] **Step 4: inner-circle.liquid** — blocks: `whatsapp` (url,label), `newsletter` (heading,placeholder). Newsletter uses `{% form 'customer' %}`. Port reference inner-circle CSS.
- [ ] **Step 5: Add locale keys** for all labels; wire groups in `layout/theme.liquid` (`{% sections 'header-group' %}`, `{% sections 'footer-group' %}`).
- [ ] **Step 6: theme check + preview + commit.** `git commit -m "feat: global header/footer/announcement/inner-circle sections"`

---

### Task 7: Home sections

**Files:**
- Create: `sections/image-banner.liquid`, `sections/trust-badges.liquid`, `sections/collections-carousel.liquid`, `sections/product-launch.liquid`, `sections/faq.liquid`; `templates/index.json`.

**Interfaces:**
- Consumes: carousel island, product-card, css-variables. Produces: home page matching reference order.

- [ ] **Step 1: image-banner** — settings image/heading/sub/cta_label/cta_link/height/overlay; CTA uses `--color-cta`.
- [ ] **Step 2: trust-badges** — blocks `badge` (icon select + text). Render row.
- [ ] **Step 3: collections-carousel** — setting `collections` (collection_list); build `slides` JSON from collections (image,title,url); root `data-island="carousel"` + `{% render 'island-props', id: section.id, props: slides_obj %}`; Liquid fallback grid.
- [ ] **Step 4: product-launch** — setting `product` (product), `eyebrow`, `description`, `show_price`; blocks `feature` (text). Gallery island from product.images; CTA link to product.url; price via `{{ product.price | money }}`.
- [ ] **Step 5: faq** — blocks `item` (question, answer) using `<details><summary>`.
- [ ] **Step 6: templates/index.json** order: banner, trust-badges, collections-carousel, product-launch x2, faq, inner-circle.
- [ ] **Step 7: theme check + preview vs reference/home-full.png + commit.** `git commit -m "feat: home sections"`

---

### Task 8: Collection template + filter-drawer island

**Files:**
- Create: `src/islands/filter-drawer.vue`, `snippets/product-card.liquid`; modify `sections/main-collection.liquid`, `templates/collection.json`; register island.

**Interfaces:**
- Consumes: collection object, storefront filtering. Produces: `product-card` snippet (params: product), filter-drawer island (props: `filters`, `sort_options`, `active`).

- [ ] **Step 1: product-card.liquid** — `{% doc %}` params product; image `image_url`, title, price, sold-out badge `{% unless product.available %}`, condition chip from metafields. CSS ported from reference card styles.
- [ ] **Step 2: main-collection.liquid** — category tabs (collection_list setting), `{% paginate collection.products by 24 %}` grid of product-card, sort select, filter drawer root `data-island="filter-drawer"` with props from `collection.filters` + `collection.sort_options`.
- [ ] **Step 3: filter-drawer.vue** — renders Size/Availability/Sort from props; applies via URL search params (storefront filtering) + `location.assign`. No hard-coded options.
- [ ] **Step 4: Register island; build + typecheck.**
- [ ] **Step 5: theme check + preview vs reference/collection-full.png + commit.** `git commit -m "feat: collection grid + filter drawer"`

---

### Task 9: Product template + condition-scale + metafields

**Files:**
- Create: `src/islands/condition-scale.vue`, `snippets/measurements.liquid`; modify `sections/main-product.liquid`, `templates/product.json`; register island; metafield definitions.

**Interfaces:**
- Consumes: gallery island, cart service, metafields. Produces: product page; condition-scale island (props: `condition`).

- [ ] **Step 1: Create metafield definitions** (namespace `thrift`) via `shopify theme metafields pull`/admin or CLI definitions JSON for the 8 keys (types per Global Constraints).
- [ ] **Step 2: main-product.liquid** — gallery island (product.images); spec panel reading `product.metafields.thrift.model/fits_like/tag_size/condition/details` with `{% if %}` guards; `{% render 'measurements', product: product %}`; condition-scale root + props; shipping timeline (settings); `{% form 'product', product %}` add-to-cart + `{{ form | payment_button }}`; trust blocks; recommendations `{{ recommendations.products }}`.
- [ ] **Step 3: measurements.liquid** — diagram + rows for waist/length/leg_opening (guarded).
- [ ] **Step 4: condition-scale.vue** — map condition→index over [worn,good,very_good,like_new]; render gradient bar + marker; props-driven.
- [ ] **Step 5: Register island; build + typecheck.**
- [ ] **Step 6: theme check + preview vs reference/product-full.png + commit.** `git commit -m "feat: thrift product template + metafields"`

---

### Task 10: cart-drawer island + static pages + locales + 1:1 verification

**Files:**
- Create: `src/islands/cart-drawer.vue`; modify header (cart trigger), `templates/page.json`, `locales/en.default.json`; pages content via admin.

**Interfaces:**
- Consumes: cart service. Produces: cart-drawer island (props: none; loads getCart), static pages.

- [ ] **Step 1: cart-drawer.vue** — on open `getCart()`; line qty +/- via `changeLine`; subtotal `formatMoney`; checkout link `/checkout`. Register island.
- [ ] **Step 2: Wire header cart button to open drawer (`data-island="cart-drawer"` root in layout).**
- [ ] **Step 3: Static pages** (contact/size-chart/condition) via `templates/page.json` + `main-page` section; content entered in admin (not hard-coded).
- [ ] **Step 4: Ensure every user-facing string has a locale key; run theme check (TranslationMissing).**
- [ ] **Step 5: Full gates + 1:1 pass.** `npm run test && npm run typecheck && npm run build && shopify theme check`; preview home/collection/product/cart at desktop+mobile vs reference screenshots; edit a setting, a metafield, and a menu in the editor and confirm storefront updates (proves editable).
- [ ] **Step 6: Commit.** `git commit -m "feat: cart drawer, pages, locales; 1:1 verification"`