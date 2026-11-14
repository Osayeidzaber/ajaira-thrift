import type { CartState } from './types'

async function json(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.description ?? `Cart error ${res.status}`)
  }
  return res.json()
}

export async function getCart(): Promise<CartState> {
  return json(await fetch('/cart.js'))
}

export async function addToCart(id: number, quantity = 1): Promise<CartState> {
  await json(
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    }),
  )
  return getCart()
}

export async function changeLine(key: string, quantity: number): Promise<CartState> {
  return json(
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    }),
  )
}

export function formatMoney(cents: number, format: string): string {
  const amount = (cents / 100).toFixed(2)
  return format.replace(/\{\{\s*amount\s*\}\}/, amount)
}