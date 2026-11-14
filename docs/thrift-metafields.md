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