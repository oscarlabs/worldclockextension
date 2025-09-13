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

        <Clock :jiggleMode="isModalVisible" :clocks="userClocks" @edit-clock="handleEditClock" @delete-clock="handleDeleteClock"/>

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
        <div class="modal-body">
          <div style="display: flex; justify-content: start ; align-items: center; flex-direction: row;">
            <h2 id="modal-title" class="modal-title-text">
              Add Clock
            </h2>
            <div style="width: 22px; height: 22px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <CustomTimezoneAutocomplete v-model="selectedLocation" @timezone-selected="handleTimezoneSelection"/>
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
import CustomTimezoneAutocomplete from "@/components/CustomTimezoneAutocomplete.vue";
import type { TimezoneOption } from '@/assets/world_timezone';

const bgStyle: Ref<Record<string, string>> = ref({})

// A constant for our storage key to avoid "magic strings".
const STORAGE_KEY = 'userSelectedClocks';

// This is oIur reactive state that drives the UI. It will be initialized with data from storage.
const userClocks = ref<TimezoneOption[]>([]);
// const selectedLocation = ref<TimezoneOption | null>(null);


// --- MODAL LOGIC START ---
const isModalVisible: Ref<boolean> = ref(false)
const pressTimer: Ref<number | null> = ref(null);

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
  clearTimeout(pressTimer.value ?? undefined);

  // Set a new timer
  pressTimer.value = setTimeout(() => {
    isModalVisible.value = true;
  }, 2000);
};

const cancelPress = () => {
  clearTimeout(pressTimer.value ?? undefined);
};

const closeModal = () => {
  isModalVisible.value = false;
  pressTimer.value = null;
};

onUnmounted(() => {
  clearTimeout(pressTimer.value ?? undefined);
})

onMounted(async () => {
  try {
    // chrome.storage.sync.get returns a promise. We await its resolution.
    // We provide a default value in case the key doesn't exist yet for a new user.
    const storedData = await chrome.storage.sync.get({[STORAGE_KEY]: []});

    // The data is returned as an object, e.g., { userSelectedClocks: [...] }
    // We assign the array to our reactive ref.
    if (storedData[STORAGE_KEY]) {
      userClocks.value = storedData[STORAGE_KEY];
    }
  } catch (error) {
    console.error("Error loading clocks from storage:", error);
    // Handle the error appropriately, maybe show a message to the user.
  }
});

/**
 * Saves a new timezone to the user's synchronized storage.
 * @param {TimezoneOption} timezone - The new timezone object to add.
 */
const handleTimezoneSelection = async (timezone: TimezoneOption) => {
  console.log('Full object received from child component:', timezone);

  const alreadyExists = userClocks.value.some(clock => clock.id === timezone.id);

  if (alreadyExists) {
    console.warn(`Timezone "${timezone.label}" already exists. Aborting save.`);
    // Optionally, provide feedback to the user here.
    return;
  }

  // Create the updated list.
  const updatedClocks = [...userClocks.value, timezone];

  try {
    // Save the entire updated array back to chrome.storage.sync.
    // The .set method takes an object with the key and the new value.
    await chrome.storage.sync.set({ [STORAGE_KEY]: updatedClocks });

    // IMPORTANT: Update the local reactive state only AFTER the save is successful.
    // This ensures your UI is a true reflection of the saved state.
    userClocks.value = updatedClocks;

  } catch (error) {
    console.error("Error saving clock to storage:", error);
    // Handle potential errors, e.g., if storage quota is exceeded.
  }
};

const handleEditClock = (clock) => {
  console.log('Edit Clock:', clock);
}

const handleDeleteClock = async (clockToDelete: TimezoneOption) => {

  const updatedClocks = userClocks.value.filter(clock => clock.tz !== clockToDelete.tz);

  try {
    // Save the new, filtered array back to storage.
    await chrome.storage.sync.set({ [STORAGE_KEY]: updatedClocks });

    // Update the local state to reflect the change in the UI.
    userClocks.value = updatedClocks;

  } catch (error) {
    console.error("Error deleting clock from storage:", error);
  }
};
</script>

<style scoped>

/* Basic Reset & Body Styling */
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  user-select: none;
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
  gap: 0.5rem;  /* 6px */
  justify-content: flex-start;
  z-index: 100; /* Ensure it's on top of everything */
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

  /*backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%); /* For Safari */

  /* Sizing and Layout */
  width: 370px; /* Fixed width */
  height: 130px; /* Fixed height */


  /* Flexbox for internal layout (header/body) */
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  flex-shrink: 0; /* Prevents header from shrinking */
}

.modal-title-text {
  margin: 5px;
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
  color: black;
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
