export interface ThriftMetafields {
  model?: string
  fits_like?: string
  tag_size?: string
  condition?: 'worn' | 'good' | 'very_good' | 'like_new'
  details?: string
  waist_cm?: number
  length_cm?: number
  leg_opening_cm?: number
}

export interface CartLine {
  key: string
  id: number
  title: string
  quantity: number
  final_line_price: number
  original_line_price?: number
  line_level_discount_allocations?: { amount: number; discount_application: { title: string } }[]
  image?: string
  url: string
}

export interface CartState {
  item_count: number
  total_price: number
  original_total_price?: number
  cart_level_discount_applications?: { title: string; total_allocated_amount: number }[]
  items: CartLine[]
}

declare global {
  const PUB_SUB_EVENTS: { cartUpdate: string }
  interface Window {
    subscribe?: (event: string, callback: (data: never) => void) => () => void
  }
}