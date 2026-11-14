# Running your Ajaira Thrift store

Everything on the storefront is changed in **Shopify admin**. You never need to touch code.

## Where things live

| I want to change… | Go to |
| --- | --- |
| Logo, favicon | Online Store → Themes → Customize → ⚙ Theme settings → Logo |
| Fonts and text sizes (whole site) | Theme settings → Typography |
| Colours (whole site) | Theme settings → Colors (colour schemes) and **Ajaira design tokens** |
| Smooth scrolling, back-to-top button, image fade-in | Theme settings → **Ajaira behaviour** |
| Buttons, cards, corners, shadows | Theme settings → Buttons / Product cards / … |
| Social links (footer icons) | Theme settings → Social media |
| Homepage hero image, button, height, text position | Customize → Home page → **veyroze banner** |
| Products shown on the homepage | Customize → Home page → **Product picks** (switch it on with the eye icon; pick products by hand or from a collection) |
| The two big "launch" features | Customize → Home page → **Product launch** → pick a product |
| FAQ questions | Customize → Home page → **FAQ** (add, remove, reorder questions) |
| Announcement bar text | Customize → Header → Announcement bar |
| Menus (header and footer) | Online Store → Navigation |
| Footer columns, withdrawal link, payment icons | Customize → Footer → **veyroze footer** |
| Products, prices, photos, stock | Products |
| Collections and their order | Products → Collections |
| Pages (About, FAQ, Size guide, …) | Online Store → Pages |
| Terms, privacy, refund, shipping policies | Settings → Policies (written by you) |

Every custom section also has **Style** and **Typography & layout** groups: colours, padding, heading size and alignment. Leave a colour empty to keep the original design.

## Sections you can add anywhere

In Customize, click **Add section** on any page. Besides Shopify's standard sections, the theme includes:

| Section | What it is |
| --- | --- |
| **Spotlight carousel** | Big product cut-outs in a sliding row; the middle one is large with its name and price. Optional auto-rotate. |
| **Collection story** | Large image beside a bold text panel with heading, text and button. Pick a collection to fill it automatically. |
| **Product rail** | Products hanging from a clothes rail you can drag sideways, with a "See availability" button. |
| **Film banner** | Full-width looping video (or image) with a big title and button. |
| **Product picks** | Product grid, hand-picked or from a collection, with optional "Showing X of Y" and a "Show more" button. |
| **Customer reviews** | Review cards you type in yourself (name, text, stars, product bought), in one or two scrolling rows. |
| **Collection hero** | Collection pages only: title, product count, description, image and links to related collections. |
| **veyroze banner**, **Product launch**, **FAQ**, **Trust badges**, **Collections carousel**, **Inner Circle** | The homepage sections; each can be reused on other pages. |

Every section has size, alignment, colour and spacing controls. Icons in the trust badges and product trust row can be replaced with your own uploaded images.

## Ready-made templates

When you create a page or collection, choose a template on the right ("Theme template"):

| Template | Use it for |
| --- | --- |
| `page.about` | Brand story: banner, text, image with text, three values |
| `page.faq` | A full FAQ page |
| `page.size-guide` | How you measure, plus fit advice |
| `page.conditions` | Your condition grades (Like new → Worn) |
| `page.shipping` | Shipping and returns, as expandable rows |
| `page.legal` | Plain text pages: terms, imprint (you write the text) |
| `page.contact` | Contact form |
| `page.lookbook` | Editorial page: spotlight carousel, collection story, product rail, film banner, product grid, reviews |
| `collection.featured` | Collection hero (title, count, description, image, related collections) above the products, no filters |
| `product.original` | Large showcase layout for special or own-label pieces |

Each template is a starting point. Open it in Customize and add, remove or reorder sections. Any section can go on any page: click **Add section**.

## Product details for second-hand pieces

Size, measurements and condition come from product **metafields** (one-time setup, see `docs/thrift-metafields.md`). After that, you fill them in at the bottom of each product page in admin.

## Collection filters

Filters (Size, Availability, Price) come from the free **Shopify Search & Discovery** app → Filters. The theme setting "Filters grouped under Size" (Customize → Collection) lists which filters appear together under "Size".
