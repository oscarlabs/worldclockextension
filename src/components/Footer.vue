<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { QUOTES, type Quote } from '@/assets/quotes_366'

// Updated props definition to be more specific
const props = defineProps<{
  attribution: {
    name: string;
    url: string;
    description: string ;
    unsplashUrl: string;
    locationCity: string | null;
    locationCountry: string | null;
  } | null
}>()

defineEmits(['showSettingsModal'])

const q = ref<Quote | null>(null)
const isCreditsVisible = ref(false) // This controls the popup visibility

// A simple function to toggle the popup
const toggleCredits = () => {
  isCreditsVisible.value = !isCreditsVisible.value
}

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime()
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(diff / oneDay)
}

// watch( () => props.attribution, (newVal, oldVal) => {
//   console.log('Attribution data updated in footer:', props.attribution)
// })

onMounted(() => {
  const idx = (dayOfYear() - 1) % QUOTES.length
  q.value = QUOTES[idx]
})
</script>

<template>
  <div class="bottom-bar">
    <!-- Wrap the button and popup in a container for positioning -->
    <div class="credits-container">
      <!-- This button now toggles the popup -->
      <div class="glass-card bottom-button" @click="toggleCredits">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-size">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
        </svg>
        Credits
      </div>

      <!-- The Credits Popup -->
      <transition name="fade-up">
        <div v-if="isCreditsVisible && attribution" class="credits-popup glass-card">
          <button @click="toggleCredits" class="close-btn" aria-label="Close credits">&times;</button>
          <p>
            Photo by <a :href="attribution.url" target="_blank" rel="noopener noreferrer">{{ attribution.name }}</a> on <a :href="attribution.unsplashUrl" target="_blank" rel="noopener noreferrer">Unsplash</a>.
          </p>
          <!-- Show description only if it exists -->
          <p v-if="attribution.description" class="description">
            "{{ attribution.description }}"
          </p>

          <div v-if="attribution.locationCity" class="location">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-size">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>
              {{ attribution.locationCity }}{{ attribution.locationCountry && `, ${attribution.locationCountry}` }}
            </span>
          </div>
        </div>
      </transition>
    </div>

    <div class="quote-text">
      <span v-if="q">{{ q.text }}</span>
      <span v-if="q?.author != 'Original'"> — {{ q?.author }}</span>
    </div>

    <div class="glass-card bottom-button" @click="$emit('showSettingsModal')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-size">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
      </svg>
      Settings
    </div>
  </div>
</template>

<style scoped>
.bottom-bar {
  min-width: max-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: white;
  width: 100%; /* Ensure it spans the full width for positioning context */
}

.bottom-button {
  align-items: center;
  gap: 0.25rem;
}

.glass-card {
  display: flex;
  color: white;
  font-weight: 600;
  padding: 0.5rem;
  user-select: none;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-card:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.3);
}

.quote-text {
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.75rem;
  text-shadow: 0 4px 8px rgba(0,0,0,.8);
  user-select: none;
  /* Allow the quote to be centered */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  max-width: 60%;
}

.icon-size {
  width: 1.5rem;
  height: 1.5rem;
}

/* --- NEW STYLES FOR CREDITS POPUP --- */

.credits-container {
  position: relative; /* This is the anchor for the absolute popup */
  z-index: 10;
}

.credits-popup {
  position: absolute;
  bottom: calc(100% + 10px); /* Position 10px above the container */
  left: 0;
  width: 300px;
  padding: 1rem;
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  line-height: 1.5;
  flex-direction: column; /* Stack content vertically */
  align-items: flex-start;
  gap: 0.5rem;
}

.credits-popup p {
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.credits-popup .description {
  font-style: italic;
  opacity: 0.9;
  /* Add word wrapping for potentially long descriptions */
  word-break: break-word;
}


.credits-popup a {
  color: #fff;
  text-decoration: underline;
  font-weight: 700;
}

.credits-popup a:hover {
  opacity: 0.8;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 8px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  padding: 4px;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.location {
  display: flex;
  align-items: center;
}

/* --- TRANSITION FOR POPUP --- */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>