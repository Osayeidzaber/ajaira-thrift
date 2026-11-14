import type { Component } from 'vue'

export const islands: Record<string, () => Promise<{ default: Component }>> = {}