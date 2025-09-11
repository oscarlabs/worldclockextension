<template>
  <div class="main-container" :style="bgStyle"
       :aria-label="`Daily background for ${new Date().toLocaleDateString()}`"
       @mousedown="startPress"
       @mouseup="cancelPress"
       @mouseleave="cancelPress"
       @touchstart.prevent="startPress"
       @touchend="cancelPress"
       @touchcancel="cancelPress"
  >
    <div class="min-width-max-container">
      <div class="top-bar-container">

        <Clock :jiggleMode="isModalVisible" :clocks="userClocks"/>

      </div>
    </div>

    <div>
      <Calendar />
      <Footer @show-settings-modal="openModal" />
    </div>
  </div>

  <transition name="fade">
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-content">
        <header class="modal-header">
          <h2 id="modal-title" class="modal-title-text">Settings</h2>
          <button @click="closeModal" class="close-button" aria-label="Close modal">&times;</button>
        </header>
        <div class="modal-body">
          <p>This is where your settings or other modal content will live. If you add enough content, the vertical scrollbar will appear as requested.</p>
          <p v-for="i in 20" :key="i">Scrollable content item #{{ i }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, Ref, ref} from 'vue'
import Clock from "@/components/Clock.vue";
import Calendar from "@/components/Calendar.vue";
import Footer from "@/components/Footer.vue";
import { BACKGROUND_IMAGES } from '@/assets/backgrounds'

const bgStyle: Ref<Record<string, string>> = ref({})

// --- MODAL LOGIC START ---
const isModalVisible: Ref<boolean> = ref(false)
const pressTimer = ref(null);

const openModal = (): void => {
  isModalVisible.value = true
}
//
// const closeModal = (): void => {
//   isModalVisible.value = false
// }
// --- MODAL LOGIC END ---

const setDailyBackground = (): void => {
  const dayOfWeek = new Date().getDay() // 0 = Sunday, 6 = Saturday
  const imageUrl = BACKGROUND_IMAGES[dayOfWeek % BACKGROUND_IMAGES.length]

  bgStyle.value = {
    backgroundImage: `url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

onMounted(() => {
  setDailyBackground()
})


// --- METHODS ---
/**
 * Starts the timer when the user presses down.
 */
const startPress = () => {
  // Clear any existing timer to prevent conflicts
  clearTimeout(pressTimer.value);

  // Set a new timer
  pressTimer.value = setTimeout(() => {
    isModalVisible.value = true;
  }, 2000);
};

/**
 * Cancels the timer if the user releases the pointer before the duration is met.
 */
const cancelPress = () => {
  clearTimeout(pressTimer.value);
};

/**
 * Closes the modal.
 */
const closeModal = () => {
  isModalVisible.value = false;
  pressTimer.value = null;
};

// --- LIFECYCLE HOOK ---
/**
 * Clean up the timer when the component is unmounted to prevent memory leaks.
 */
onUnmounted(() => {
  clearTimeout(pressTimer.value);
});




const userClocks = ref([
  // Your home
  { label: 'Lima', tz: 'America/Lima' },
  // South America
  { label: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
  { label: 'Brasília',     tz: 'America/Sao_Paulo' },

  // USA — Eastern
  { label: 'New York', tz: 'America/New_York' },
  { label: 'Boston',   tz: 'America/New_York' },
  { label: 'Miami',    tz: 'America/New_York' },
  { label: 'Atlanta',  tz: 'America/New_York' },

  // USA — Central
  { label: 'Chicago',  tz: 'America/Chicago' },
  { label: 'Dallas',   tz: 'America/Chicago' },
  { label: 'Houston',  tz: 'America/Chicago' },

  // USA — Mountain
  { label: 'Denver',   tz: 'America/Denver' },

  // USA — Pacific
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'San Francisco', tz: 'America/Los_Angeles' },
  { label: 'Seattle',    tz: 'America/Los_Angeles' },

  // Europe (WET/UTC±1 and CET/CEST)
  { label: 'London',  tz: 'Europe/London' },
  // { label: 'Dublin',  tz: 'Europe/Dublin' },
  // { label: 'Lisbon',  tz: 'Europe/Lisbon' },
  { label: 'Paris',   tz: 'Europe/Paris' },
  { label: 'Berlin',  tz: 'Europe/Berlin' },
  { label: 'Madrid',  tz: 'Europe/Madrid' },

  // Ukraine (single national zone; uses DST EET/EEST)
  { label: 'Kyiv',  tz: 'Europe/Kyiv' },

  // Australia & New Zealand (note DST differences + half-hour)
  { label: 'Sydney',    tz: 'Australia/Sydney' },
  // { label: 'Melbourne', tz: 'Australia/Melbourne' },
  // { label: 'Brisbane',  tz: 'Australia/Brisbane' }, // no DST
  // { label: 'Adelaide',  tz: 'Australia/Adelaide' }, // +0:30 offset vs Sydney/Melb
  // { label: 'Perth',     tz: 'Australia/Perth' },
  // { label: 'Auckland',  tz: 'Pacific/Auckland' },
  // { label: 'Wellington',tz: 'Pacific/Auckland' },
  { label: 'Queenstown', tz: 'Pacific/Auckland' },
  // { label: 'Chatham Is.', tz: 'Pacific/Chatham' }   // +0:45 quirk
])

</script>

<style scoped>

/* Basic Reset & Body Styling */
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

/* Converted Tailwind Classes */

.main-container {
  /* h-screen w-screen flex flex-col justify-between p-4 */
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem; /* 16px */
  box-sizing: border-box; /* Important for padding not to add to width/height */
}

.min-width-max-container {
  /* min-w-max */
  min-width: max-content;
}

.top-bar-container {
  /* w-fit h-fit fixed top-2.5 left-3 right-3 flex flex-wrap gap-1.5 justify-start z-[5] */
  width: fit-content;
  height: fit-content;
  position: fixed;
  top: 0.625rem;  /* 10px */
  left: 0.75rem;   /* 12px */
  right: 0.75rem;  /* 12px */
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;  /* 6px */
  justify-content: flex-start;
  z-index: 5;
}

/* --- MODAL STYLES START --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50; /* Ensure it's on top of everything */
}

.modal-content {
  /* The "Crystal Glass" effect */
  background: rgba(150, 150, 150, 0.15); /* Semi-transparent white background */
  /*backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%); /* For Safari */

  /* Sizing and Layout */
  width: 80%; /* Fixed width */
  height: 550px; /* Fixed height */
  border-radius: 12px;
  border: 6px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);

  /* Flexbox for internal layout (header/body) */
  display: flex;
  flex-direction: column;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0; /* Prevents header from shrinking */
}

.modal-title-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* The requested vertical scroll */
  flex-grow: 1; /* Allows body to fill available space */
}

.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}

/* --- Transition Styles --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* --- MODAL STYLES END --- */

</style>
