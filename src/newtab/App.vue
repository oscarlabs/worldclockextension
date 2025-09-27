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

        <Clock :jiggleMode="isModalVisible" :clocks="userClocks" :teamMembers="teamMembers" @edit-clock="handleEditClock" @delete-clock="handleDeleteClock"/>

      </div>
    </div>

    <div>
      <Calendar />
      <Footer @show-settings-modal="openModal" :attribution="bgAttribution" />
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
          <CustomTimezoneAutocomplete @timezone-selected="handleTimezoneSelection"/>
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div v-if="isEditVisible" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-content-edit">
        <div class="modal-header-edit">
          Timezone: {{selectedTimezone}}
        </div>
        <div class="modal-body-edit">
          <div style="display: flex; justify-content: start ; align-items: center; flex-direction: row;">
            <div class="chip-container" v-if="selectedLocations.length > 0">
              <div v-for="location in selectedLocations" :key="location.id" class="chip">

                <span>{{ location.label }}</span>

                <button
                    @click="removeLocation(location.id)"
                    class="remove-chip-btn"
                    aria-label="Remove location"
                >
                  &times;
                </button>

              </div>
            </div>
          </div>
        </div>
        <div class="modal-header-edit">

          <TagInput :teamMembers="groupTeamMembers" @addTeamMember="handleAddTeamMember" @removeTeamMember="handleRemoveTeamMember"/>

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
import TagInput from "@/components/TagInput.vue";

// Import our new/updated services
import { fetchAndDownloadImage } from '@/lib/unsplash.service';
import { getStoredImage, storeImage, cleanupOldImages } from '@/lib/database.service';

const bgStyle: Ref<Record<string, string>> = ref({})
const bgAttribution = ref<{ name: string; url: string; description: string; unsplashUrl: string; locationCity: string; locationCountry: string } | null>(null); // For attribution
const currentBgUrl = ref<string | null>(null); // To manage object URL lifecycle

const LOCAL_STORAGE = false

// --- Caching and Background Logic ---
// const BACKGROUND_CACHE_KEY = 'dailyBackgroundCache'

// A constant for our storage key to avoid "magic strings".
const STORAGE_KEY = 'userSelectedClocks';
const MEMBERS_KEY = 'userTeamMembers';

// This is our reactive state that drives the UI. It will be initialized with data from storage.
const userClocks = ref<TimezoneOption[]>([]);

const selectedTimezone:Ref<string | null> = ref(null);
const selectedLocations = ref<TimezoneOption[]>([]);

export type TeamMember = {
  name: string;
  tz: string;
};

const teamMembers = ref<TeamMember[]>([]);
const groupTeamMembers = ref<TeamMember[]>([]);

// --- MODAL LOGIC START ---
const isModalVisible: Ref<boolean> = ref(false)
const isEditVisible: Ref<boolean> = ref(false)
const pressTimer: Ref<number | null> = ref(null);

const openModal = (): void => {
  isModalVisible.value = true
}
//
// const closeModal = (): void => {
//   isModalVisible.value = false
// }
// --- MODAL LOGIC END ---

const setDailyBackground = async (): Promise<void> => {
  // A consistent ID for the day, e.g., '2025-09-27'
  const todayId = new Date().toISOString().split('T')[0];

  // 1. Check IndexedDB first
  const cachedImage = await getStoredImage(todayId);

  if (cachedImage) {
    // console.log('Image loaded from IndexedDB cache.');
    // Create a temporary local URL from the blob
    currentBgUrl.value = URL.createObjectURL(cachedImage.blob);
    bgStyle.value = { backgroundImage: `url("${currentBgUrl.value}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };

    // Populate attribution directly from the cached metadata
    bgAttribution.value = {
      name: cachedImage.authorName,
      url: cachedImage.authorUrl,
      description: cachedImage.description,
      unsplashUrl: cachedImage.unsplashUrl,
      locationCity: cachedImage.locationCity,
      locationCountry: cachedImage.locationCountry
    };
    return;
  }

  // 2. If not in DB, fetch from Unsplash
  // console.log('No valid cache found. Fetching new image from Unsplash.');
  let query = 'new zealand nature'; // A nice fallback
  const queryOptions = ["nature", "city", "art", "sightseeing"];
  const randomIndex = Math.floor(Math.random() * queryOptions.length);
  const randomOption = queryOptions[randomIndex];

  if (userClocks.value.length > 0) {
    const randomClock = userClocks.value[Math.floor(Math.random() * userClocks.value.length)];
    query = randomClock.label.split(',')[0] + " " + randomOption;
  }

  const newImage = await fetchAndDownloadImage(query);

  if (newImage) {
    // 3. Store the complete package in IndexedDB
    await storeImage({
      id: todayId,
      blob: newImage.blob,
      authorName: newImage.authorName,
      authorUrl: newImage.authorUrl,
      description: newImage.description,
      unsplashUrl: newImage.unsplashUrl,
      locationCity: newImage.locationCity,
      locationCountry: newImage.locationCountry,
    });

    // 4. Display the new image
    currentBgUrl.value = URL.createObjectURL(newImage.blob);
    bgStyle.value = { backgroundImage: `url("${currentBgUrl.value}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    bgAttribution.value = {
      name: newImage.authorName,
      url: newImage.authorUrl,
      description: newImage.description,
      unsplashUrl: newImage.unsplashUrl,
      locationCity: newImage.locationCity,
      locationCountry: newImage.locationCountry,
    };

    // 5. Run cleanup in the background
    cleanupOldImages();

  } else {
    // 6. Fallback to static images if the API fails
    const dayOfWeek = new Date().getDay();
    const fallbackUrl = BACKGROUND_IMAGES[dayOfWeek % BACKGROUND_IMAGES.length];
    bgStyle.value = { backgroundImage: `url("${fallbackUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
  }
};

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
  isEditVisible.value = false;
  pressTimer.value = null;
};

onUnmounted(() => {

  if (currentBgUrl.value) {
    URL.revokeObjectURL(currentBgUrl.value);
  }

  clearTimeout(pressTimer.value ?? undefined);
})

onMounted(async () => {
  try {
    if(!LOCAL_STORAGE){
      const storedData = await chrome.storage.sync.get({[STORAGE_KEY]: []});
      const storedTeamMembers = await chrome.storage.sync.get({[MEMBERS_KEY]: []});

      if(storedData[STORAGE_KEY]) {
        userClocks.value = storedData[STORAGE_KEY];
      }

      if(storedTeamMembers[MEMBERS_KEY]) {
        teamMembers.value = storedTeamMembers[MEMBERS_KEY];
      }

    }else{
      const storedDataString = localStorage.getItem(STORAGE_KEY);

      const storedMembersString = localStorage.getItem(MEMBERS_KEY);

      userClocks.value = JSON.parse(storedDataString || '[]');
      teamMembers.value = JSON.parse(storedMembersString || '[]');
    }

    setDailyBackground()

  } catch (error) {
    console.error("Error loading clocks from storage:", error);

  }
});

/**
 * Saves a new timezone to the user's synchronized storage.
 * @param {TimezoneOption} timezone - The new timezone object to add.
 */
const handleTimezoneSelection = async (timezone: TimezoneOption) => {
  // console.log('Full object received from child component:', timezone);

  const alreadyExists = userClocks.value.some(clock => clock.id === timezone.id);

  if (alreadyExists) {
    console.warn(`Timezone "${timezone.label}" already exists. Aborting save.`);
    // Optionally, provide feedback to the user here.
    return;
  }

  const updatedClocks = [...userClocks.value, timezone];

  try {

    if(!LOCAL_STORAGE){
      await chrome.storage.sync.set({ [STORAGE_KEY]: updatedClocks })

      userClocks.value = updatedClocks
    }else{
      const dataString = JSON.stringify(updatedClocks)

      localStorage.setItem(STORAGE_KEY, dataString)

      userClocks.value = updatedClocks

    }

  } catch (error) {
    console.error("Error saving clock to storage:", error);
    // Handle potential errors, e.g., if storage quota is exceeded.
  }
};

const handleEditClock = async (clockToEdit: TimezoneOption) => {
  const selectedClocks = userClocks.value.filter( clock => clock.tz === clockToEdit.tz )
  selectedTimezone.value = clockToEdit.tz;
  selectedLocations.value = [...selectedClocks]

  groupTeamMembers.value = teamMembers.value.filter(teamMembers => teamMembers.tz === clockToEdit.tz)

  isModalVisible.value = false
  isEditVisible.value = true
}

const handleAddTeamMember = async (teamMember: string) => {

  teamMembers.value.push({'name': teamMember, 'tz': selectedTimezone.value})

  const updatedTeamMebers = [...teamMembers.value]

  try {

    if(!LOCAL_STORAGE){
      await chrome.storage.sync.set({ [MEMBERS_KEY]: updatedTeamMebers });

      // userClocks.value = updatedClocks;
    }else{
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedTeamMebers));

      // userClocks.value = updatedClocks;
    }

  } catch (error) {
    console.error("Error deleting clock from storage:", error);
  }
}

const handleRemoveTeamMember = async (teamMember: string) => {
  teamMembers.value = teamMembers.value.filter(tm => tm.name !== teamMember)

  const updatedTeamMembers = [...teamMembers.value]

  try {

    if(!LOCAL_STORAGE){
      await chrome.storage.sync.set({ [MEMBERS_KEY]: updatedTeamMembers });

      // userClocks.value = updatedClocks;
    }else{
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedTeamMembers));

      // userClocks.value = updatedClocks;
    }

  } catch (error) {
    console.error("Error deleting clock from storage:", error);
  }
}

const removeLocation = async ( locationId ) => {

  selectedLocations.value = selectedLocations.value.filter(clock => clock.id !== locationId);

  const updatedClocks = userClocks.value.filter(clock => clock.id !== locationId);

  try {

    if(!LOCAL_STORAGE){
      await chrome.storage.sync.set({ [STORAGE_KEY]: updatedClocks });

      userClocks.value = updatedClocks;
    }else{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClocks));

      userClocks.value = updatedClocks;
    }

  } catch (error) {
    console.error("Error deleting clock from storage:", error);
  }
}

const handleDeleteClock = async (clockToDelete: TimezoneOption) => {

  const updatedClocks = userClocks.value.filter(clock => clock.tz !== clockToDelete.tz);

  try {

    if(!LOCAL_STORAGE){
      await chrome.storage.sync.set({ [STORAGE_KEY]: updatedClocks });

      userClocks.value = updatedClocks;
    }else{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClocks));

      userClocks.value = updatedClocks;
    }

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
  user-select: none;
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
  user-select: none;
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

.modal-content-edit {
  /* Frosted Glass Effect */
  background: rgba(25, 25, 25, 0.45); /* A dark, semi-transparent background */
  backdrop-filter: blur(15px);          /* This blurs the content BEHIND the element */
  -webkit-backdrop-filter: blur(15px);  /* For Safari browser support */

  /* Shape and Definition */
  border-radius: 16px;                  /* Softer, rounded corners */
  border: 1px solid rgba(255, 255, 255, 0.18); /* A subtle light border to catch the light */

  /* Depth and Polish */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); /* A soft shadow to lift it off the page */

  /* Layout */
  width: 500px;                         /* A fixed width can look cleaner */
  max-width: 90%;                       /* Ensures it's responsive on smaller screens */
  color: #f5f5f5;                       /* A slightly off-white for text, easy on the eyes */
}

/*
 * Style the header section for better spacing and clarity
 */
.modal-header-edit {
  font-size: 1.1em;
  font-weight: 500;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* A subtle separator line */
  display: flex;         /* 1. Turns on Flexbox layout */
  align-items: center;   /* 2. Vertically centers the text and button */
  gap: 12px;             /* 3. Adds a nice space between the text and button */
}

/*
 * Style the body section
 */
.modal-body-edit {
  padding: 20px;
  min-height: 60px; /* Give it some minimum height so it doesn't look empty */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* A subtle separator line */
}

/* Styling the button to match the image */
.add-member-btn {
  /* Reset button styles */
  background: white;
  border: none;
  padding: 0;

  /* Sizing and Shape */
  width: 25px;
  height: 25px;
  border-radius: 50%; /* Makes it a perfect circle */

  /* Center the SVG icon inside */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Interaction */
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.add-member-btn:hover {
  opacity: 0.85;
}

/* Styling the SVG icon itself */
.add-member-btn svg {
  width: 20px;
  height: 20px;
  color: #333; /* Color of the '+' symbol */
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


.chip-container {
  display: flex;         /* Aligns children (chips) in a row */
  flex-wrap: wrap;       /* Allows chips to wrap to the next line if they overflow */
  gap: 8px;              /* The perfect way to add space BETWEEN chips */
  align-items: center;   /* Vertically aligns chips in the middle */
  padding: 5px 0;        /* Adds a little vertical space to the container */
}

.chip {
  /* This is the key change: use flexbox to align label and button */
  display: inline-flex;  /* Use inline-flex to keep chips on the same line */
  align-items: center;    /* Vertically center the text and the 'X' */
  gap: 8px;               /* Adds a nice space between the label and the 'X' */

  /* Your existing styles are great */
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 16px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.25);

  /* Adjust padding to be on the chip itself */
  padding: 6px 8px 6px 12px; /* A little less padding on the right for the button */
}

/* (Optional) Add a subtle hover effect for better UX */
.chip:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

/* --- 2. ADD styles for the new remove button --- */
.remove-chip-btn {
  /* Reset default button styles */
  background: none;
  border: none;
  padding: 0;
  margin: 0;

  /* Appearance */
  color: #ffffff;
  opacity: 0.7;
  cursor: pointer;
  font-size: 18px; /* Make the 'X' a bit bigger */
  line-height: 1;

  /* Make a circular hover area for better UX */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%; /* Makes the background circle shape */
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.remove-chip-btn:hover {
  background-color: rgba(0, 0, 0, 0.4); /* Darken slightly on hover */
  opacity: 1;
}
</style>
