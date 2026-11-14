# veyroze.com parity checklist

Crawled 2026-11-15 from `/sitemap.xml` and the nav. The live store has 570 product
URLs, 29 collections (many are size collections such as `w32` and `xl`), 6 pages,
1 blog, policies, and a returns portal app.

Status key: ✅ matches · 🟡 present, needs visual pass · ❌ missing · 🅰 app/admin content (not theme code)

## Global
| Item | veyroze | Ours | Status |
| --- | --- | --- | --- |
| Announcement bar | "Free shipping in Germany on orders over 150€" | `announcement-bar` | ✅ |
| Header | Logo centered; Home · All · Collections▾ · Contact · Return; country/currency + language selectors; search/account/cart | `header` | 🟡 menu items are admin (main-menu) |
| Cart drawer | Dawn drawer | `cart-drawer` island | ✅ |
| Inner Circle (WhatsApp + newsletter) | `inner-circle` (rewritten 1:1, `anic`) | ✅ |
| Footer | Customer Service / Information / payment icons / socials / withdrawal link / country + language selects | `veyroze-footer` (ported 1:1, `vft`) | ✅ menus are admin |
| Floating privacy button (bottom-left, slides in after 1.2s, tooltip, ripple) | `privacy-shield` (ported 1:1; opens Shopify's cookie preferences) | ✅ |

## Home (`/`)
| Section | Ours | Status |
| --- | --- | --- |
| Hero banner + "Shop all" (725px / 525px, separate mobile image, 30% overlay, button at 75%) | `veyroze-banner` (ported 1:1) | ✅ |
| Trust badges ×3 | `trust-badges` | ✅ |
| Collections carousel | `collections-carousel` | ✅ |
| Product launch ×2: 2-col, NEW badge, CSS-only gallery with arrows and dots, gold CTA; image right then left | `product-launch` (rewritten 1:1, `vzl`) | ✅ |
| FAQ: 2-col cards, +/− icon, animated open; 5th full-width "Shipping rates" card holding the shipping calculator | `faq` (rebuilt: `item` + `page` blocks) | ✅ calculator HTML is page content 🅰 |
| Judge.me reviews cards carousel | `apps` section with `@app` block | ✅ slot added; install Judge.me 🅰 |

## Collection (`/collections/*`, `/collections/all`)
| Item | Ours | Status |
| --- | --- | --- |
| Category nav (BOOTS Cowboy·Harness / JACKETS Leather·Biker / JEANS Straight·Bootcut / SHIRTS Dress Shirts) | `collection-tabs` | ✅ |
| "Filter — SIZE · AVAILABILITY · SORT" bar + drawer, product count | `snippets/vz-facets.liquid` + `assets/vz-facets.{css,js}` (toggle "veyroze filter bar" in the grid section; size grouping via "Filters grouped under Size") | ✅ needs store preview |
| 3×3 grid, product cards with condition chip | grid + `card-product` | ✅ |
| Size collections (`w26`–`w40`, `xs`–`xl`, `40`–`45`) | admin smart collections | 🅰 |
| `/collections` list | Dawn `main-list-collections` | ✅ |

## Product (`/products/*`)
| Item | Ours | Status |
| --- | --- | --- |
| Hero gallery + info (vzh) | `product-hero` | ✅ |
| Delivery timer ("order within…") | `delivery` block in `product-hero` → `snippets/delivery-timeline.liquid` (day offsets in settings, dates computed client-side) | ✅ needs store preview |
| Trust badges pro | `trust-badges` | ✅ |
| Specs / measurements / condition scale | `thrift-specs`, `measurements`, `condition-scale` | ✅ |
| Related products | `related-products` | ✅ |

## Pages (all use the Dawn `main-page` template; content is admin page HTML)
| URL | Content | Ours | Status |
| --- | --- | --- | --- |
| `/pages/contact` | Title "Kontakt" + Dawn contact form | `page.contact.json` | ✅ |
| `/pages/size-chart` | Full-width SIZE GUIDE image | `page.json` + page image | 🅰 |
| `/pages/condition` | "Conditions" rich text | `page.json` | 🅰 |
| `/pages/kategorien` | Title only | `page.json` | 🅰 |
| `/pages/klarna` | Klarna info text | `page.json` | 🅰 |
| `/pages/data-sharing-opt-out` | Shopify privacy page | auto | 🅰 |

## Other
| URL | Ours | Status |
| --- | --- | --- |
| `/cart` | Dawn cart-items + cart-footer | ✅ |
| `/search` | Dawn main-search | ✅ |
| `/blogs/news` | Dawn main-blog | ✅ |
| `/404` | Dawn main-404 | ✅ |
| `/policies/*` (refund, privacy, terms, legal notice) | Shopify policies | 🅰 Settings → Policies |
| `/apps/returns` (Returns portal) | returns app | 🅰 |
| `/account/*` | Dawn customer templates | ✅ |

## Remaining theme work (priority order)
1. Pixel pass at 1440px and 375px on home, collection and product, compared with `reference/veyroze/*.png`.

## Store setup checklist (admin, not code)
- Search & Discovery: add filters Size (variant option) / Waist / Length (metafields) and Availability, Price. Their param names go in the grid's "Filters grouped under Size" setting.
- Menus: `main-menu` (Home, All, Collections → Boots/Jackets/Jeans/Shirts, Contact, Return); footer menus Customer Service and Information.
- Pages: contact, size-chart, condition, kategorien, klarna, plus a `shipping-calculator` page holding the calculator HTML. Link it from the FAQ "Shipping rates" block.
- Apps: Judge.me (add its block to the home `reviews` section), returns portal.
- Policies, markets (country/currency selector), and metafields (`docs/thrift-metafields.md`).

## Rendered verification (2026-11-15, `shopify theme dev` on unpublished theme "Ajaira veyroze dev")
Section heights, ours vs veyroze, at 1024px desktop and 375px phone:

| Section | Desktop ours / vz | Phone ours / vz |
| --- | --- | --- |
| Banner | 725 / 725 | 525 / 525 |
| Trust badges | 55 / 55 | 68 / 68 |
| Collections carousel | 675 / 675 | 562 / 562 |
| Launch 1 / 2 | 622 / 622, 678 / 678 | shorter: no product chosen (content) |
| FAQ | 396 / 396 | 477 / 477 |
| Inner Circle | 360 / 360 | 244 / 244 |
| Footer | 328 / 345 | 196 / 327: no payment icons, logo or extra countries on dev store (content) |
| Collection filter bar | 84 / 85 | — |
| Product card | 221 wide, 4 columns, 24 per page (matches) | — |

Product: `product.json` now mirrors veyroze's thrift layout (Dawn stacked gallery, trust icons, delivery timer, Conditions/Size Guide pop-ups). The vzh hero lives in `product.original.json` for own-brand pieces, as veyroze does.

## Animations (checked 2026-11-15 on kdbp9c-pv)
Same hover mode (`animate--hover-default`), the same scroll reveal only on the reviews/app section, and the same transitions on carousel cards (0.45s), launch CTA, FAQ cards and Inner Circle buttons. Privacy button slide-in and ripple were ported.

## Editability
Every custom section exposes its content (text, images, links, products, collections, menus, pages) and a **Style** group (colours and padding). Colour settings are empty by default; empty keeps veyroze's exact (often semi-transparent) value. Fixed UI labels (filter bar, buttons, aria labels) are translation strings: Online Store → Themes → … → Edit default theme content.
