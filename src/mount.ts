import { createApp } from 'vue'
import { islands } from './islands'

export async function mountIslands(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>('[data-island]')
  for (const el of Array.from(nodes)) {
    if (el.hasAttribute('data-island-mounted')) continue
    const name = el.dataset.island!
    const id = el.dataset.islandId!
    const loader = islands[name]
    if (!loader) continue
    const script = document.querySelector(`[data-island-props="${id}"]`)
    const props = script ? JSON.parse(script.textContent ?? '{}') : {}
    const { default: component } = await loader()
    el.setAttribute('data-island-mounted', '')
    createApp(component, props).mount(el)
  }
}

if (typeof document !== 'undefined') mountIslands()