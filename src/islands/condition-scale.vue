<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ condition?: string; labels: string[] }>()
const steps = ['worn', 'good', 'very_good', 'like_new'] as const

const index = computed(() => {
  const i = steps.indexOf((props.condition ?? '') as (typeof steps)[number])
  return i < 0 ? 0 : i
})
</script>

<template>
  <div class="condition-scale">
    <div class="segs">
      <span v-for="(s, i) in steps" :key="s" class="seg" :class="{ on: i <= index }"></span>
    </div>
    <div class="labels">
      <span v-for="(l, i) in labels" :key="l" :class="{ on: i === index }">{{ l }}</span>
    </div>
  </div>
</template>

<style scoped>
.segs {
  display: flex;
  gap: 0.4rem;
}
.seg {
  flex: 1;
  height: 0.35rem;
  border-radius: 2px;
  background: var(--color-line);
}
.seg.on {
  background: var(--color-ok);
}
.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--color-faint);
}
.labels .on {
  color: var(--color-ink);
}
</style>