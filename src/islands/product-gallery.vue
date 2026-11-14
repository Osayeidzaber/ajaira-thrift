<script setup lang="ts">
import { ref } from 'vue'

interface GalleryImage {
  src: string
  alt?: string
  srcset?: string
}

interface GalleryStrings {
  prev: string
  next: string
  thumb: string
}

const props = defineProps<{ images: GalleryImage[]; strings: GalleryStrings }>()

const active = ref(0)
let touchX = 0
let touchY = 0

function count() {
  return props.images.length
}
function go(i: number) {
  const n = count()
  if (!n) return
  active.value = ((i % n) + n) % n
}
function step(dir: number) {
  go(active.value + dir)
}
function thumbLabel(i: number) {
  return props.strings.thumb.replace('{index}', String(i + 1))
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    step(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    step(1)
  }
}
function onTouchStart(e: TouchEvent) {
  touchX = e.touches[0].clientX
  touchY = e.touches[0].clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchX
  const dy = e.changedTouches[0].clientY - touchY
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
}
</script>

<template>
  <div class="vzh__gallery-inner" tabindex="-1" @keydown="onKey">
    <div class="vzh__stage" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
      <div class="vzh__frames">
        <div
          v-for="(img, i) in images"
          :key="i"
          class="vzh__frame"
          :class="{ 'is-active': i === active }"
        >
          <img
            class="vzh__stage-img"
            :src="img.src"
            :srcset="img.srcset"
            :alt="img.alt || ''"
            sizes="(max-width: 990px) 100vw, 520px"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
            draggable="false"
          >
        </div>
      </div>
      <div v-if="images.length > 1" class="vzh__navs">
        <button type="button" class="vzh__nav vzh__nav--prev" :aria-label="strings.prev" @click="step(-1)">
          <span></span>
        </button>
        <button type="button" class="vzh__nav vzh__nav--next" :aria-label="strings.next" @click="step(1)">
          <span></span>
        </button>
      </div>
    </div>
    <div v-if="images.length > 1" class="vzh__thumbs">
      <button
        v-for="(img, i) in images"
        :key="i"
        type="button"
        class="vzh__thumb"
        :class="{ 'is-active': i === active }"
        :aria-label="thumbLabel(i)"
        :aria-current="i === active ? 'true' : undefined"
        @click="go(i)"
      >
        <img :src="img.src" :alt="img.alt || ''" loading="lazy" draggable="false">
      </button>
    </div>
  </div>
</template>