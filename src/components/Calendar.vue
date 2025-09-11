<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const timeStr = ref<string>('00:00:00')
const dateStr = ref<string>('')

function tick() {
  const now = new Date()
  timeStr.value = now.toLocaleTimeString([], { hour12: false })
  const day = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  const daySuffix = getDaySuffix(now.getDate())
  dateStr.value = `${day}${daySuffix}`
}

function getDaySuffix(day: number) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

let interval: number | undefined

onMounted(async () => {
  tick()
  interval = window.setInterval(tick, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="center-text-container">
    <div class="date-text">
      {{ dateStr }}
    </div>
    <div class="time-text">
      {{ timeStr }}
    </div>
  </div>
</template>

<style scoped>
.center-text-container {
  margin: auto;
  color: white;
}

.date-text {
  /* text-5xl m-auto text-center text-shadow-lg text-shadow-gray-900/65 */
  font-size: 3rem; /* 48px */
  line-height: 1;
  margin: auto;
  text-align: center;
  /* NOTE: text-shadow is a custom utility. This is a common interpretation of 'lg'. */
  text-shadow: 0 4px 8px rgba(0,0,0,.8);
}

.time-text {
  /* text-9xl m-auto text-center text-shadow-lg text-shadow-gray-900/65 */
  font-size: 8rem; /* 128px */
  line-height: 1;
  margin: auto;
  text-align: center;
  text-shadow: 0 4px 8px rgba(0,0,0,.8);
}
</style>