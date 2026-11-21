import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addToCart, formatMoney } from '../cart'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('addToCart', () => {
  it('POSTs to /cart/add.js and returns the cart', async () => {
    const cart = { item_count: 1, total_price: 12990, items: [] }
    ;(fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => cart })
    const res = await addToCart(42, 1)
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/cart/add.js',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(res.item_count).toBe(1)
  })

  it('throws on a non-ok response', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ description: 'sold out' }),
    })
    await expect(addToCart(42)).rejects.toThrow('sold out')
  })
})

describe('formatMoney', () => {
  it('formats cents using a money format', () => {
    expect(formatMoney(12990, '€{{amount}}')).toBe('€129.90')
  })
  it("handles Tk, thousands and other Shopify formats", () => {
    expect(formatMoney(70000, "Tk {{amount}}")).toBe("Tk 700.00")
    expect(formatMoney(123456, "Tk {{amount}}")).toBe("Tk 1,234.56")
    expect(formatMoney(123400, "Tk {{ amount_no_decimals }}")).toBe("Tk 1,234")
    expect(formatMoney(123456, "{{amount_with_comma_separator}} €")).toBe("1.234,56 €")
  })
})