<script setup lang="ts">
import { ref, computed } from 'vue'

interface Img {
  src: string
  alt?: string
}

const props = defineProps<{ images: Img[] }>()
const active = ref(0)
const current = computed(() => props.images[active.value])

function step(dir: number) {
  const n = props.images.length
  if (!n) return
  active.value = (active.value + dir + n) % n
}
</script>

<template>
  <div class="gallery">
    <div class="main">
      <img v-if="current" :src="current.src" :alt="current.alt || ''">
      <button class="prev" aria-label="Previous image" @click="step(-1)">&#8249;</button>
      <button class="next" aria-label="Next image" @click="step(1)">&#8250;</button>
    </div>
    <div class="thumbs">
      <button
        v-for="(img, i) in images"
        :key="i"
        :class="{ on: i === active }"
        :aria-label="'View image ' + (i + 1)"
        @click="active = i"
      >
        <img :src="img.src" :alt="img.alt || ''" loading="lazy">
      </button>
    </div>
  </div>
</template>

<style scoped>
.main {
  position: relative;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-panel);
}
.main img { width: 100%; display: block; object-fit: cover; }
.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.4rem; height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  background: var(--color-panel);
  color: var(--color-ink);
  cursor: pointer;
}
.prev { left: 0.5rem; }
.next { right: 0.5rem; }
.thumbs { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.thumbs button {
  flex: 1;
  padding: 0;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-panel);
  cursor: pointer;
  opacity: 0.6;
}
.thumbs button.on { opacity: 1; border-color: var(--color-ink); }
.thumbs img { width: 100%; display: block; object-fit: cover; }
</style>