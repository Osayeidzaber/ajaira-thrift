# Thrift product metafields

The product template reads `product.metafields.thrift.*`. Create these definitions once per store:
**Shopify admin → Settings → Custom data → Products → Add definition**.
Namespace and key must match exactly; the theme guards every field, so products without them render normally.

| Key | Definition type | Name | Notes |
| --- | --- | --- | --- |
| `thrift.model` | Single line text | Model | e.g. "512 Bootcut" |
| `thrift.fits_like` | Single line text | Fits like | e.g. "W36/L34" |
| `thrift.tag_size` | Single line text | Tag size | e.g. "W36/L32" |
| `thrift.condition` | Single line text | Condition | One of: `worn`, `good`, `very_good`, `like_new` |
| `thrift.details` | Single line text | Details | e.g. "Cool wash" |
| `thrift.waist_cm` | Decimal | Waist (cm) | Flat measurement, e.g. 46.5 |
| `thrift.length_cm` | Decimal | Length (cm) | Flat measurement, e.g. 101.0 |
| `thrift.leg_opening_cm` | Decimal | Leg opening (cm) | Flat measurement, e.g. 24.0 |
| `thrift.material` | Single line text | Material | e.g. "100% real leather" |
| `thrift.shoulder_cm` | Decimal | Shoulder width (cm) | Jackets/shirts |
| `thrift.hem_cm` | Decimal | Hem width (cm) | Jackets |
| `thrift.chest_cm` | Decimal | Chest (cm) | Tops |

All definitions: namespace `thrift`, storefronts access enabled (default for product metafields).

## Where each field renders

- `model`, `fits_like`, `tag_size`, `condition`, `details` → spec panel + chips (`snippets/thrift-specs.liquid`, "Thrift specs" block on the product template).
- `waist_cm`, `length_cm`, `leg_opening_cm` → measurements rows (`snippets/measurements.liquid`, "Thrift details" section).
- `condition` → condition scale (`sections/thrift-details.liquid`, `condition-scale` Vue island) and the condition chip on product cards (`snippets/card-product.liquid`).

## Bulk import (optional)

For many products, use the admin CSV import or the GraphQL `metafieldsSet` mutation with
`namespace: "thrift"` and the keys above; `condition` values must stay within the four allowed strings.
## Size charts (Find your size pop-up)

Two ways to add a chart. Both use the same simple format: first line = column
names, then one size per line, cells separated by `,` or `|` (a spreadsheet
saved as CSV can be pasted straight in).

```
Size, Chest (in), Length (in), Shoulder (in), Sleeve (in)
S, 21, 26, 17.5, 24
M, 22.5, 27, 18.5, 24.5
L, 24, 28, 19.5, 25
```

1. **Many products at once (by tag or name):** Theme editor → Product page →
   add a **Size chart** block → "Use this chart for products with…" = a tag
   (e.g. `chart-jacket`) or a word in the title (e.g. `leather`) → fill
   **Chart title** and **Chart rows**. Every matching product shows it, and
   editing the block updates them all.
2. **One product only:** product page in admin → Metafields → **Size chart
   title** and **Size chart rows**. This wins over any block.

Products with neither show the default chart from Product page → Size guide.
