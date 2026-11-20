<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Slide {
  url: string
  title: string
  src400?: string
  src700?: string
  src1000?: string
}

const props = defineProps<{ slides: Slide[] }>()

// Many copies of the slides so the track never runs out; after each move it
// silently re-centres on the middle copy, so the loop is endless both ways.
const COPIES = 9
const N = computed(() => props.slides.length)
const MID = computed(() => Math.floor(COPIES / 2) * N.value)

const items = computed<Slide[]>(() => {
  const out: Slide[] = []
  for (let c = 0; c < COPIES; c++) out.push(...props.slides)
  return out
})

const track = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const current = ref(0)

let isJumping = false
let dragging = false
let startX = 0
let startY = 0
let dragDelta = 0
let lastX = 0
let lastT = 0
let velocity = 0
let offset0 = 0
let moveDx = 0
let lockedAxis: 'x' | 'y' | null = null
let resizeRaf = 0

function tier(i: number) {
  const diff = i - current.value
  return {
    'is-active': diff === 0,
    'is-prev': diff === -1,
    'is-next': diff === 1,
    'is-prev2': diff === -2,
    'is-next2': diff === 2,
  }
}
function origIndex(idx: number) {
  const n = N.value
  return ((idx % n) + n) % n
}
function recentre() {
  const target = MID.value + origIndex(current.value)
  if (target !== current.value) void performJump(target)
}
function goToDot(i: number) {
  const n = N.value
  let d = i - origIndex(current.value)
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  goTo(current.value + d, true)
}
function cardW() {
  const el = track.value?.children[0] as HTMLElement | undefined
  return el ? el.offsetWidth : 0
}
function gapPx() {
  return track.value ? parseInt(getComputedStyle(track.value).gap) || 0 : 0
}
function viewW() {
  return viewport.value ? viewport.value.clientWidth : 0
}
function calcX(idx: number) {
  return Math.round(viewW() / 2 - cardW() / 2 - idx * (cardW() + gapPx()))
}
function setX(x: number, animate: boolean) {
  const t = track.value
  if (!t) return
  t.style.transition = animate ? '' : 'none'
  t.style.transform = `translate3d(${x}px, 0, 0)`
}
function update(animate: boolean) {
  setX(calcX(current.value), animate)
}
// Move to a slide. If the target is near the ends of the copies, first jump
// (invisibly) to the same slide in the middle copy, then animate from there.
async function goTo(idx: number, animate: boolean) {
  if (isJumping) return
  const max = items.value.length - 3
  if (idx < 2 || idx > max) {
    const delta = idx - current.value
    await performJump(MID.value + origIndex(current.value))
    idx = current.value + delta
  }
  current.value = idx
  update(animate)
}

// Invisible jump: switch to the same slide in another copy with every
// transition off, wait for Vue to re-render the card classes, then turn the
// transitions back on. Without the wait the cards visibly re-animate.
async function performJump(newCurrent: number) {
  const t = track.value
  if (!t || newCurrent === current.value) return
  isJumping = true
  t.classList.add('vc-no-transition')
  current.value = newCurrent
  setX(calcX(newCurrent), false)
  await nextTick()
  void t.offsetHeight
  t.classList.remove('vc-no-transition')
  t.style.transition = ''
  isJumping = false
}

function onTransitionEnd(e: TransitionEvent) {
  if (e.target !== track.value || e.propertyName !== 'transform') return
  if (isJumping || dragging) return
  recentre()
}

function onStart(x: number, y: number) {
  dragging = true
  startX = x
  startY = y
  dragDelta = 0
  moveDx = 0
  lockedAxis = null
  lastX = x
  lastT = performance.now()
  velocity = 0
  const t = track.value
  offset0 = 0
  if (t) {
    // grab mid-animation from where the track really is, not where it was heading
    const x = new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    const w = cardW() + gapPx() || 1
    current.value = Math.round((viewW() / 2 - cardW() / 2 - x) / w)
    offset0 = x - calcX(current.value)
    t.style.transition = 'none'
    t.classList.add('is-dragging')
    setX(x, false)
  }
}
function onMove(x: number, y: number, ev?: Event) {
  if (!dragging) return
  const dx = x - startX
  const dy = y - startY
  if (!lockedAxis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
    lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  if (lockedAxis === 'y') return
  if (ev && ev.cancelable) ev.preventDefault()
  const now = performance.now()
  if (now > lastT) velocity = 0.8 * ((x - lastX) / (now - lastT)) + 0.2 * velocity
  lastX = x
  lastT = now
  moveDx = dx
  dragDelta = offset0 + dx
  setX(calcX(current.value) + dragDelta, false)
}
function onEnd() {
  if (!dragging) return
  dragging = false
  track.value?.classList.remove('is-dragging')
  if (lockedAxis !== 'x') {
    update(true)
    return
  }
  // One card per swipe (two only for a drag longer than ~1.5 cards), so no
  // collection is ever skipped. A quick flick counts as a swipe.
  const w = cardW() + gapPx() || 1
  const flick = Math.abs(velocity) > 0.35
  let steps = 0
  // direction comes from the finger's own movement, never from where a
  // half-finished slide happened to be
  if (Math.abs(moveDx) > Math.max(30, w * 0.15) || (flick && Math.abs(moveDx) > 8)) steps = moveDx < 0 ? 1 : -1
  if (Math.abs(moveDx) > w * 1.5) steps *= 2
  if (steps) goTo(current.value + steps, true)
  else update(true)
}
function onCardClick(i: number, e: MouseEvent) {
  if (Math.abs(moveDx) > 6) {
    e.preventDefault()
    return
  }
  if (i !== current.value) {
    e.preventDefault()
    goTo(i, true)
  }
}
function onKey(e: KeyboardEvent) {
  const tag = (document.activeElement && document.activeElement.tagName) || ''
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return
  const r = viewport.value?.getBoundingClientRect()
  if (!r || r.bottom < 0 || r.top > window.innerHeight) return
  if (e.key === 'ArrowRight') goTo(current.value + 1, true)
  if (e.key === 'ArrowLeft') goTo(current.value - 1, true)
}
function onResize() {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => update(false))
}

const onMouseMove = (e: MouseEvent) => {
  if (dragging) onMove(e.clientX, e.clientY)
}
const onTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientX, e.touches[0].clientY)
const onTouchMove = (e: TouchEvent) => {
  if (dragging) onMove(e.touches[0].clientX, e.touches[0].clientY, e)
}

onMounted(() => {
  if (!N.value) return
  current.value = MID.value
  track.value?.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('resize', onResize)
  document.addEventListener('keydown', onKey)
  const init = () => update(false)
  requestAnimationFrame(() => requestAnimationFrame(init))
})
onBeforeUnmount(() => {
  track.value?.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onEnd)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKey)
  cancelAnimationFrame(resizeRaf)
})
</script>

<template>
  <div v-if="N" class="vc-viewport" ref="viewport">
    <div
      ref="track"
      class="vc-track"
      @transitionend="onTransitionEnd"
      @mousedown="onStart($event.clientX, $event.clientY)"
      @touchstart.passive="onTouchStart"
      @touchend="onEnd"
      @touchcancel="onEnd"
    >
      <a
        v-for="(s, i) in items"
        :key="i"
        class="vc-card"
        :class="tier(i)"
        :href="s.url"
        :data-index="i"
        draggable="false"
        @click="onCardClick(i, $event)"
      >
        <div class="vc-img-wrap">
          <img
            v-if="s.src700"
            :src="s.src700"
            :srcset="`${s.src400} 400w, ${s.src700} 700w, ${s.src1000} 1000w`"
            sizes="(max-width: 768px) 70vw, 30vw"
            :alt="s.title"
            loading="eager"
            fetchpriority="high"
            width="700"
            height="933"
          >
        </div>
        <div class="vc-label"><span>{{ s.title }}</span></div>
      </a>
    </div>
  </div>
  <div v-if="N" class="vc-dots">
    <button
      v-for="(s, i) in slides"
      :key="i"
      class="vc-dot"
      :class="{ 'is-active': i === origIndex(current) }"
      :aria-label="`Collection ${i + 1}`"
      @click="goToDot(i)"
    ></button>
  </div>
</template>

<style scoped>
.vc-viewport {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 16px 0 24px;
}
.vc-track {
  display: flex;
  align-items: center;
  gap: 0;
  will-change: transform;
  backface-visibility: hidden;
  cursor: grab;
  touch-action: pan-y;
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.vc-track.is-dragging { cursor: grabbing; }
.vc-track.vc-no-transition,
.vc-track.vc-no-transition .vc-card { transition: none !important; }
.vc-card {
  position: relative;
  flex: 0 0 30%;
  text-decoration: none;
  color: inherit;
  transform-origin: center center;
  transform: scale(0.5);
  opacity: 0;
  z-index: 0;
  pointer-events: none;
  transition:
    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.5s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.vc-card.is-prev2 { transform: scale(0.65) translateX(55%); opacity: 0.4; z-index: 1; pointer-events: auto; }
.vc-card.is-next2 { transform: scale(0.65) translateX(-55%); opacity: 0.4; z-index: 1; pointer-events: auto; }
.vc-card.is-prev { transform: scale(0.82) translateX(22%); opacity: 0.65; z-index: 2; pointer-events: auto; }
.vc-card.is-next { transform: scale(0.82) translateX(-22%); opacity: 0.65; z-index: 2; pointer-events: auto; }
.vc-card.is-active { transform: scale(1); opacity: 1; z-index: 3; pointer-events: auto; }
.vc-card.is-active .vc-img-wrap {
  outline: 2px solid #fff;
  outline-offset: 4px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
}
.vc-img-wrap {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #d8d8d8;
  border-radius: 0;
}
.vc-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
.vc-label {
  margin-top: 14px;
  padding: 0 6px;
  line-height: 1.35;
  text-wrap: balance;
  overflow-wrap: break-word;
  hyphens: auto;
  text-align: center;
  font-size: var(--vc-label-size, 16px);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.35s ease 0.15s, transform 0.35s ease 0.15s;
}
.vc-card.is-active .vc-label { opacity: 1; transform: translateY(0); }
.vc-dots { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }
.vc-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid var(--vc-dot, #ffffff);
  background: transparent;
  cursor: pointer;
  padding: 0;
  opacity: 0.65;
  transition: opacity 0.3s, transform 0.3s, background 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}
.vc-dot.is-active { background: var(--vc-dot, #ffffff); opacity: 1; transform: scale(1.3); }
@media (max-width: 768px) {
  .vc-card { flex: 0 0 60%; }
  .vc-card.is-prev { transform: scale(0.82) translateX(24%); }
  .vc-card.is-next { transform: scale(0.82) translateX(-24%); }
  .vc-card.is-prev2 { transform: scale(0.62) translateX(60%); opacity: 0.3; }
  .vc-card.is-next2 { transform: scale(0.62) translateX(-60%); opacity: 0.3; }
  .vc-label { font-size: calc(var(--vc-label-size, 16px) - 1px); }
}
@media (max-width: 480px) {
  .vc-card { flex: 0 0 64%; }
  .vc-card.is-prev { transform: scale(0.8) translateX(26%); }
  .vc-card.is-next { transform: scale(0.8) translateX(-26%); }
  .vc-card.is-prev2 { transform: scale(0.58) translateX(65%); opacity: 0.25; }
  .vc-card.is-next2 { transform: scale(0.58) translateX(-65%); opacity: 0.25; }
  .vc-label { font-size: 14px; letter-spacing: 0.1em; }
}
</style>