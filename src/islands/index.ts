import type { Component } from 'vue'

export const islands: Record<string, () => Promise<{ default: Component }>> = {
  carousel: () => import('./carousel.vue'),
  gallery: () => import('./gallery.vue'),
  'product-gallery': () => import('./product-gallery.vue'),
  'condition-scale': () => import('./condition-scale.vue'),
  'cart-drawer': () => import('./cart-drawer.vue'),
}