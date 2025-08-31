<template>
  <div class="container">
    <BackgroundImage />
    <div class="top-clocks">
      <WorldClocks />
    </div>

    <div class="center-stack">
      <div class="date">{{ dateStr }}</div>
      <div class="clock">{{ timeStr }}</div>
      <div class="greeting">Hello there<span v-if="name">, {{ name }}</span></div>
    </div>

    <div class="footer">
      <button class="footer-icon green-check" @click="onTaskClick" title="Tasks">✅</button>
      <FooterQuote />
      <button class="footer-icon" @click="onSettingsClick" title="Settings">⚙️</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BackgroundImage from '@/components/BackgroundImage.vue'
import WorldClocks from '@/components/WorldClocks.vue'
import FooterQuote from '@/components/FooterQuote.vue'
import { getSync, setSync } from '@/lib/storage'

const name = ref<string>('')
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
  const stored = await getSync<{ name?: string }>('user_prefs')
  if (stored?.name) name.value = stored.name
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})

async function onSettingsClick() {
  const newName = prompt('Enter your name to personalize the greeting:', name.value || '')
  if (newName !== null) {
    name.value = newName.trim()
    const prefs = await getSync<any>('user_prefs') || {}
    prefs.name = name.value
    await setSync('user_prefs', prefs)
  }
}
function onTaskClick() {
  alert('Tasks placeholder — hook up your task UI here.')
}
</script>

<style scoped>
.container {
  position: relative; width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  color: white;
  overflow: hidden;
}
.top-clocks {
  position: fixed; top: 12px; left: 12px; right: 12px;
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  z-index: 5;
}
.center-stack {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; z-index: 3;
}
.date { font-size: 2rem; margin-bottom: 8px; text-shadow: 0 3px 6px rgba(0,0,0,.7); }
.clock { font-size: 8rem; font-weight: 500; letter-spacing: 2px; text-shadow: 0 4px 8px rgba(0,0,0,.8); }
.greeting { font-size: 2.2rem; text-shadow: 0 3px 6px rgba(0,0,0,.7); }

.footer {
  position: fixed; bottom: 12px; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px; font-size: 1rem;
}
.footer-icon {
  font-size: 1.6rem; cursor: pointer; user-select: none; padding: 4px;
  transition: transform .2s ease, color .2s ease, border-bottom .2s ease;
  border-bottom: 2px solid transparent;
}
.footer-icon:hover {
  transform: scale(1.15); border-bottom: 2px solid rgba(255,255,255,0.8); color: #fff;
}
.green-check { color: #4ade80; }
@media (max-width: 1024px) { .clock { font-size: 7rem; } }
@media (max-width: 640px) {
  .clock { font-size: 5rem; letter-spacing: 1px; }
  .date { font-size: 1.6rem; } .greeting { font-size: 1.8rem; }
}
</style>
