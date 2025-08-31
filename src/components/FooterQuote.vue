<template>
  <div class="footer-quote">
    <span v-if="q">{{ q.text }} — {{ q.author }}</span>
    <span v-else>Loading quote...</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QUOTES, type Quote } from '@/assets/quotes_366'

const q = ref<Quote | null>(null)

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime()
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(diff / oneDay)
}

onMounted(() => {
  const idx = (dayOfYear() - 1) % QUOTES.length
  q.value = QUOTES[idx]
})
</script>

<style scoped>
.footer-quote {
  flex: 1; text-align: center; font-style: italic; font-size: 1rem; padding: 0 20px; opacity: .9;
}
</style>
