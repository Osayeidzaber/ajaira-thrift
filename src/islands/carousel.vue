<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Slide {
  image: string
  alt?: string
  url?: string
  label?: string
}

const props = withDefaults(defineProps<{ slides: Slide[]; autoplay?: boolean }>(), {
  autoplay: false,
})

const track = ref<HTMLElement | null>(null)
const active = ref(0)

function scroll(dir: number) {
  track.value?.scrollBy({ left: dir * track.value.clientWidth, behavior: 'smooth' })
}
function onScroll() {
  const t = track.value
  if (!t) return
  active.value = Math.round(t.scrollLeft / t.clientWidth)
}
function goTo(i: number) {
  track.value?.scrollTo({ left: i * track.value.clientWidth, behavior: 'smooth' })
}

let timer: number | undefined
onMounted(() => {
  if (props.autoplay) timer = window.setInterval(() => scroll(1), 5000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="carousel">
    <div ref="track" class="track" @scroll="onScroll">
      <a v-for="(s, i) in slides" :key="i" class="slide" :href="s.url || '#'">
        <img :src="s.image" :alt="s.alt || ''" loading="lazy">
        <span v-if="s.label" class="label">{{ s.label }}</span>
      </a>
    </div>
    <button class="prev" aria-label="Previous" @click="scroll(-1)">&#8249;</button>
    <button class="next" aria-label="Next" @click="scroll(1)">&#8250;</button>
    <div class="dots">
      <button
        v-for="(s, i) in slides"
        :key="i"
        :class="{ on: i === active }"
        :aria-label="'Go to slide ' + (i + 1)"
        @click="goTo(i)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.carousel { position: relative; }
.track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.track::-webkit-scrollbar { display: none; }
.slide {
  position: relative;
  flex: 0 0 70%;
  scroll-snap-align: center;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-panel);
}
.slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
.label {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 0.6rem;
  text-align: center;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}
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
.dots { display: flex; justify-content: center; gap: 0.4rem; margin-top: 0.8rem; }
.dots button {
  width: 0.5rem; height: 0.5rem;
  border-radius: 50%;
  border: none;
  background: var(--color-faint);
  cursor: pointer;
  padding: 0;
}
.dots button.on { background: var(--color-ink); }
@media (min-width: 750px) {
  .slide { flex: 0 0 30%; }
}
</style>