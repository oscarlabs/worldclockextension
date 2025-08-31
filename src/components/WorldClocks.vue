<template>
  <div class="wc" v-for="c in clocks" :key="c.tz">
    <div class="wc-city">{{ c.name }}</div>
    <div class="wc-time">{{ c.time }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type Clock = { name: string; tz: string; time: string }
const clocks = ref<Clock[]>([
  { name: 'Lima', tz: 'America/Lima', time: '' },
  { name: 'New York', tz: 'America/New_York', time: '' },
  { name: 'London', tz: 'Europe/London', time: '' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', time: '' },
])

function tick() {
  clocks.value = clocks.value.map(c => ({
    ...c,
    time: new Date().toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit' })
  }))
}

let interval: number | undefined
onMounted(() => { tick(); interval = window.setInterval(tick, 1000 * 30) })
onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<style scoped>
.wc {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(4px);
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.wc-city { font-size: .9rem; font-weight: 600; opacity: .95; margin-bottom: 2px; }
.wc-time { display: inline-flex; align-items: center; gap: 4px; font-size: 1.05rem; font-weight: 600; }
</style>
