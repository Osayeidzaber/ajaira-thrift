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
  const fixed = (cents / 100).toFixed(2)
  const whole = Math.round(cents / 100).toString()
  const group = (n: string, sep: string, dec: string) => {
    const [i, d] = n.split('.')
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
    return d ? g + dec + d : g
  }
  return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_m, key: string) => {
    switch (key) {
      case 'amount_no_decimals':
        return group(whole, ',', '.')
      case 'amount_with_comma_separator':
        return group(fixed, '.', ',')
      case 'amount_no_decimals_with_comma_separator':
        return group(whole, '.', ',')
      case 'amount_with_apostrophe_separator':
        return group(fixed, "'", '.')
      default:
        return group(fixed, ',', '.')
    }
  })
}