<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { changeLine, formatMoney, getCart } from '../cart'
import type { CartLine, CartState } from '../types'

interface DrawerStrings {
  title: string
  empty: string
  continue: string
  subtotal: string
  checkout: string
  viewCart: string
  close: string
  remove: string
  increase: string
  decrease: string
  loading: string
  countOne: string
  countOther: string
}

const props = defineProps<{
  strings: DrawerStrings
  moneyFormat: string
  iconCart: string
  iconCartEmpty: string
  cartUrl: string
  checkoutUrl: string
  continueUrl: string
}>()

const cart = ref<CartState | null>(null)
const open = ref(false)
const busy = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)

function syncBubble() {
  const bubble = document.getElementById('cart-icon-bubble')
  if (!bubble || !cart.value) return
  const count = cart.value.item_count
  const icon = bubble.querySelector('.svg-wrapper')
  if (icon) icon.innerHTML = count > 0 ? props.iconCart : props.iconCartEmpty
  let wrap = bubble.querySelector('.cart-count-bubble')
  if (count <= 0) {
    wrap?.remove()
    return
  }
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.className = 'cart-count-bubble'
    wrap.innerHTML = '<span aria-hidden="true"></span><span class="visually-hidden"></span>'
    bubble.appendChild(wrap)
  }
  const spans = wrap.querySelectorAll('span')
  spans[0].textContent = count < 100 ? String(count) : ''
  spans[1].textContent = (count === 1 ? props.strings.countOne : props.strings.countOther).replace(
    '{count}',
    String(count),
  )
}

async function setOpen(value: boolean) {
  open.value = value
  document.body.style.overflow = value ? 'hidden' : ''
  if (value) {
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.getElementById('cart-icon-bubble')?.focus()
  }
}

async function openDrawer() {
  cart.value = await getCart()
  syncBubble()
  await setOpen(true)
}

function close() {
  void setOpen(false)
}

async function setQuantity(line: CartLine, quantity: number) {
  busy.value = true
  try {
    cart.value = await changeLine(line.key, quantity)
    syncBubble()
  } finally {
    busy.value = false
  }
}

function label(template: string, title: string) {
  return template.replace('{{ product }}', title).replace('{{ title }}', title)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close()
}

let unsubscribe: (() => void) | undefined

onMounted(() => {
  const host = document.querySelector('cart-drawer') as HTMLElement & {
    renderContents?: (state: CartState) => void
  }
  if (host) {
    host.renderContents = (state) => {
      cart.value = state
      syncBubble()
      void setOpen(true)
    }
  }
  document.getElementById('cart-icon-bubble')?.addEventListener('click', (event) => {
    event.preventDefault()
    void openDrawer()
  })
  document.addEventListener('keydown', onKeydown)
  unsubscribe = window.subscribe?.(PUB_SUB_EVENTS.cartUpdate, (data: { cartData?: CartState }) => {
    if (data?.cartData) {
      cart.value = data.cartData
      syncBubble()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  unsubscribe?.()
})
</script>

<template>
  <div class="drawer" :class="{ open }">
    <div class="overlay" @click="close"></div>
    <aside class="panel" role="dialog" aria-modal="true" :aria-label="strings.title">
      <header class="head">
        <h2 class="title">{{ strings.title }}</h2>
        <button ref="closeButton" type="button" class="close" :aria-label="strings.close" @click="close">
          &times;
        </button>
      </header>

      <p v-if="!cart" class="empty">{{ strings.loading }}</p>
      <template v-else-if="cart.items.length === 0">
        <p class="empty">{{ strings.empty }}</p>
        <a class="continue" :href="continueUrl">{{ strings.continue }}</a>
      </template>
      <template v-else>
        <ul class="lines">
          <li v-for="line in cart.items" :key="line.key" class="line">
            <img v-if="line.image" class="thumb" :src="line.image" :alt="line.title" width="64" height="80">
            <div class="info">
              <a class="name" :href="line.url">{{ line.title }}</a>
              <span class="price">{{ formatMoney(line.final_line_price, moneyFormat) }}</span>
              <div class="qty">
                <button
                  type="button"
                  :aria-label="label(strings.decrease, line.title)"
                  :disabled="busy || line.quantity <= 1"
                  @click="setQuantity(line, line.quantity - 1)"
                >
                  &minus;
                </button>
                <span aria-live="polite">{{ line.quantity }}</span>
                <button
                  type="button"
                  :aria-label="label(strings.increase, line.title)"
                  :disabled="busy"
                  @click="setQuantity(line, line.quantity + 1)"
                >
                  +
                </button>
                <button
                  type="button"
                  class="remove"
                  :aria-label="label(strings.remove, line.title)"
                  :disabled="busy"
                  @click="setQuantity(line, 0)"
                >
                  {{ strings.remove }}
                </button>
              </div>
            </div>
          </li>
        </ul>
        <footer class="foot">
          <div class="subtotal">
            <span>{{ strings.subtotal }}</span>
            <span>{{ formatMoney(cart.total_price, moneyFormat) }}</span>
          </div>
          <a class="checkout" :href="checkoutUrl">{{ strings.checkout }}</a>
          <a class="view-cart" :href="cartUrl">{{ strings.viewCart }}</a>
        </footer>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 90;
}
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(28rem, 100vw);
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  border-left: 1px solid var(--color-line);
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 0.25s ease, visibility 0.25s;
  z-index: 91;
  padding: 1.2rem;
}
.drawer.open .overlay {
  opacity: 1;
  pointer-events: auto;
}
.drawer.open .panel {
  transform: none;
  visibility: visible;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-line-soft);
  padding-bottom: 0.8rem;
}
.title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 400;
}
.close {
  background: none;
  border: 0;
  color: var(--color-mute);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}
.close:hover {
  color: var(--color-ink);
}
.empty {
  margin: 2rem 0 1rem;
  color: var(--color-mute);
  text-align: center;
}
.continue {
  display: block;
  text-align: center;
  color: var(--color-cta);
}
.lines {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
.line {
  display: flex;
  gap: 0.9rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-line-soft);
}
.thumb {
  object-fit: cover;
  border-radius: var(--radius);
  background: var(--color-bg);
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.name {
  color: var(--color-ink);
  text-decoration: none;
  font-size: 0.85rem;
}
.name:hover {
  text-decoration: underline;
}
.price {
  color: var(--color-mute);
  font-size: 0.8rem;
}
.qty {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.3rem;
}
.qty button {
  background: none;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  color: var(--color-ink);
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
  padding: 0;
}
.qty button:disabled {
  opacity: 0.4;
  cursor: default;
}
.qty span {
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.85rem;
}
.qty .remove {
  width: auto;
  border: 0;
  margin-left: auto;
  color: var(--color-faint);
  font-size: 0.7rem;
  text-decoration: underline;
}
.qty .remove:hover {
  color: var(--color-wine-bright);
}
.foot {
  border-top: 1px solid var(--color-line-soft);
  padding-top: 1rem;
}
.subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.9rem;
}
.checkout {
  display: block;
  text-align: center;
  background: var(--color-cta);
  color: var(--color-bg);
  padding: 0.9rem;
  border-radius: var(--radius);
  text-decoration: none;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.8rem;
}
.checkout:hover {
  background: var(--color-cta-hover);
}
.view-cart {
  display: block;
  text-align: center;
  margin-top: 0.7rem;
  color: var(--color-mute);
  font-size: 0.75rem;
}
</style>