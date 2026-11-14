# Ajaira Thrift — Agent Guide

A Shopify theme for Ajaira Thrift, built on **Dawn 15.x** with **Vue 3 islands**.
The goal is a **1:1 visual replica of https://www.veyroze.com**, with every piece
of content editable in the theme editor / Shopify admin. The code is the source
of truth. If this file and the code disagree, fix this file.

> README.md still describes the original Skeleton theme. Ignore its
> "no sections / no JSON templates" rules: this repo uses sections.

## Stack

| Layer | Where | Notes |
| --- | --- | --- |
| Liquid (Dawn) | `layout/`, `sections/`, `snippets/`, `templates/*.json` | JSON templates + section groups (`header-group.json`, `footer-group.json`) |
| Vue islands | `src/islands/*.vue`, registry `src/islands/index.ts` | Mounted by `src/mount.ts` |
| Build | `vite.config.ts` → `assets/islands.js` + `assets/islands.css` | **Single bundle, `inlineDynamicImports: true`** — never split chunks (two Vue copies break refs) |
| Tests | `vitest` (`src/__tests__`) | `src/cart.ts` is the typed Shopify AJAX cart service |

Commands: `npm run build` · `npm run watch` · `npm test` · `npm run typecheck` ·
`shopify theme dev` · `shopify theme check`.

`assets/islands.js` / `islands.css` are **build output**. Edit `src/` and run the
build again. Never hand-edit those two files.

## Non-negotiables

- **Match veyroze first.** Before changing a section, read the matching markup in
  `reference/veyroze/*.html` (or the live site). Copy its class names, spacing,
  type sizes and colours. Pull exact CSS from the live site with
  `document.styleSheets`, because the captures leave out section-inline CSS.
- **Everything editable.** No hard-coded products, collections, copy, images or
  links. Use section/block settings, menus, metafields, or page content.
  Hard-coded text is only acceptable as a schema `default`/preset.
- **Translated UI strings.** Fixed UI labels (buttons, aria labels) use
  `{{ 'key' | t }}` with keys in `locales/en.default.json`. Merchant copy
  comes from settings.
- **Shopify routes.** Use `routes.*` and never hardcode `/cart`, `/search`,
  `/collections`.
- **Whitespace:** `<li {% ... %}`, not `<li{% ... %}`.
- **Keep `{{ block.shopify_attributes }}`** on every block's root element.
- **Theme Check stays clean.** Fix the Liquid. Don't add exceptions.

## Section conventions (custom veyroze sections)

- One file per section in `sections/`, with a `{% schema %}` that has `presets`
  so it can be added in the editor.
- CSS for custom sections goes in a `{% stylesheet %}` tag in the section (the
  existing convention). Use the tokens from `snippets/css-variables.liquid`
  (`--color-bg`, `--color-panel`, `--color-ink`, `--color-mute`, `--color-line`,
  `--color-wine`, `--color-cta`, `--radius`, `--container`, `--spacing`).
- Small vanilla behaviour (toggles) goes in a `{% javascript %}` tag or in
  `assets/*.js`. Stateful/interactive UI is a Vue island.
- Third-party apps (Judge.me reviews, etc.) go in through `@app` blocks
  (`sections/apps.liquid`). Never paste vendor markup.

## Vue islands

```liquid
<div data-island="carousel" data-island-id="{{ section.id }}"></div>
{% render 'island-props', id: section.id, props: some_object %}
```

`mountIslands()` finds each `[data-island]`, reads the matching
`<script type="application/json" data-island-props="ID">`, lazy-loads the
component from `src/islands/index.ts` and mounts it. To add an island:
create `src/islands/name.vue`, register it in `index.ts`, then `npm run build`.
Islands must be props-driven (no fetched/hard-coded catalog data), except
`cart-drawer`, which talks to the Cart AJAX API through `src/cart.ts`.

Current islands: `carousel`, `gallery`, `product-gallery`, `condition-scale`,
`cart-drawer`.

## Page map (veyroze → ours)

| veyroze section | Our section | Template |
| --- | --- | --- |
| header + announcement | `header`, `announcement-bar` | `header-group.json` |
| bild banner | `image-banner` | `index.json` |
| trust badges | `trust-badges` | index, product |
| featured collection carousel | `collections-carousel` (carousel island) | index |
| product launch ×2 | `product-launch` | index |
| FAQ (+ shipping calculator card) | `faq` | index |
| Judge.me reviews carousel | `apps` (`@app` block) | index |
| Inner circle + footer | `inner-circle`, `footer` | `footer-group.json` |
| collection tabs + grid (3×3) | `collection-tabs`, `main-collection-product-grid` | `collection.json` |
| product hero (vzh) + specs/accordions | `product-hero`, `related-products` | `product.json` |

Thrift product data lives in `product.metafields.thrift.*`
(see `docs/thrift-metafields.md`).

## Global behaviour

`assets/ajaira-behaviour.{js,css}` (smooth scroll via vendored `assets/lenis.min.js`, back-to-top, image fade) is driven by Theme settings → "Ajaira behaviour" through data attributes on `<html>` in `layout/theme.liquid`. Scrollable overlays must stay in the `NESTED` selector list so they keep native scrolling.

## Client editability

This is a client theme: every section needs content settings plus a **Style** group (colours/padding) and, where text is large, **Typography & layout** (size, alignment). Colour settings have no default; blank keeps the CSS fallback (the veyroze value). New templates live in `templates/page.*.json` / `collection.featured.json`; `docs/CLIENT-GUIDE.md` is the owner's manual. Never write legal text (terms, policies) yourself.

## Reference material

- `reference/veyroze/` — HTML, CSS and full-page screenshots of home,
  collection and product (not tracked by git; used for comparison only).
- `docs/superpowers/specs|plans/` — the original design spec and build plan.
- `docs/veyroze-parity.md` — the current gap list. Update it when you close a gap.

## Definition of done for a change

`npm test && npm run typecheck && npm run build && shopify theme check`, then
compare the page with veyroze at 1440px and 375px.
