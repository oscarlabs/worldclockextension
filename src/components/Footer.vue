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

<template>
  <div class="bottom-bar">
    <div class="glass-card bottom-button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-size">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
      </svg>
      Settings
    </div>
    <div class="quote-text">
      <span v-if="q">{{ q.text }}</span>
      <span v-if="q?.author != 'Original'"> — {{ q?.author }}</span>
    </div>
    <div class="glass-card bottom-button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-size">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      Account
    </div>
  </div>
</template>

<style scoped>
.bottom-bar {
  /* min-w-max flex flex-row justify-between items-center font-semibold text-white */
  min-width: max-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: white;
}

.bottom-button {
  /* flex + shared glass-card styles */
  align-items: center;
  gap: 0.25rem; /* For spacing icon and text */
}

.glass-card {
  /* Base styles for the glass-like cards */
  display: flex;
  color: white;
  font-weight: 600;
  padding: 0.5rem; /* 8px */
  user-select: none;
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* For Safari */
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-card:hover {
  cursor: pointer;
}

.quote-text {
  /* font-semibold text-xl text-shadow-lg text-shadow-gray-900/65 */
  font-weight: 600;
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
  text-shadow: 0 4px 8px rgba(0,0,0,.8);
}

.icon-size {
  /* size-6 */
  width: 1.5rem; /* 24px */
  height: 1.5rem; /* 24px */
}
</style>