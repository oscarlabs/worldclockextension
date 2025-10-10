<script setup lang="ts">
import {onMounted, onUnmounted, Ref, ref, watch, nextTick} from 'vue'

import ClocksSection from '@/components/sections/ClocksSection.vue'
import CalendarSection from '@/components/sections/CalendarSection.vue'
import FooterSection from '@/components/sections/FooterSection.vue'

import SideDrawer from '@/components/overlays/SideDrawer.vue'
import VerticalTabs from '@/components/widgets/VerticalTabs.vue'

import { useStorage } from '@/composables/useStorage'
import { useDailyBackground } from '@/composables/useDailyBackground'
import { useWeather } from '@/composables/useWeather'
import { useClocks, type TeamMember } from '@/composables/useClocks'

const STORAGE_KEY_CLOCKS = 'userSelectedClocks'
const STORAGE_KEY_MEMBERS = 'userTeamMembers'

const { data: userClocks } = useStorage<TimezoneOption[]>(STORAGE_KEY_CLOCKS, [])
const { data: teamMembers } = useStorage<TeamMember[]>(STORAGE_KEY_MEMBERS, [])

const {
  selectedLocations,
  groupTeamMembers,
  addClock,
  deleteClock,
  startEditClock,
  addTeamMember,
  removeTeamMember,
} = useClocks(userClocks, teamMembers)

const { bgStyle, bgAttribution, currentBgUrl, setDailyBackground, cleanup } = useDailyBackground(userClocks)
const { weatherData } = useWeather(userClocks);

import CustomTimezoneAutocomplete from "@/components/CustomTimezoneAutocomplete.vue"
import type { TimezoneOption } from '@/assets/world_timezone'
import TagInput from "@/components/TagInput.vue"

// AQUI AQUI 1 LINEA
// const groupTeamMembers = ref<TeamMember[]>([]);

import { useBookmarks } from '@/composables/useBookmarks'

// --- BOOKMARKS LOGIC ---

// const { bookmarks, addCurrentTabAsBookmark, deleteBookmark } = useBookmarks();
// const isBookmarksVisible = ref(false);
//
// const toggleBookmarks = () => {
//   isBookmarksVisible.value = !isBookmarksVisible.value;
// };

// Drawer state and functions

const activeDrawer = ref<null | 'clocks' | 'bookmarks'>(null);

// This function opens, closes, or switches the active drawer
const handleDrawerOpen = (drawerName: 'clocks' | 'bookmarks') => {
  activeDrawer.value = activeDrawer.value === drawerName ? null : drawerName;
};

// This function is called by the drawer when it wants to close (e.g., via Escape key)
const handleDrawerClose = () => {
  activeDrawer.value = null;
};

// Drawer state and functions - end


const autocompleteComponentRef = ref<InstanceType<typeof CustomTimezoneAutocomplete> | null>(null);

// AQUIAQUI 2 LINRAS
// const selectedTimezone:Ref<string | null> = ref(null);
// const selectedLocations = ref<TimezoneOption[]>([]);

// --- MODAL LOGIC START --- AQUIAQUI 2LINEAS
// const isModalVisible: Ref<boolean> = ref(false)
// const isEditVisible: Ref<boolean> = ref(false)



// AQUAQUI W FUNCTIONES
// const openModal = (): void => {
//   isModalVisible.value = true
// }
//
// const closeModal = () => {
//   isModalVisible.value = false;
//   isEditVisible.value = false;
// };

onUnmounted(async () => {
  if (currentBgUrl.value) {
    URL.revokeObjectURL(currentBgUrl.value);
  }
})

onMounted(async () => {
  try {
    await setDailyBackground()
  } catch (error) {
    console.error("Error on mount:", error);
  }
});

// AQUIAQUI EL WATCH
// watch(isModalVisible, (newValue) => {
//   if (newValue) {
//     nextTick(() => {
//       autocompleteComponentRef.value?.focusInput();
//     });
//   }
// });

const handleTimezoneSelection = async (timezone: TimezoneOption) => {

  const alreadyExists = userClocks.value.some(clock => clock.id === timezone.id);

  if (alreadyExists) {
    console.warn(`Timezone "${timezone.label}" already exists`);
    return;
  }

  userClocks.value.push(timezone)
};

const handleEditClock = async (clockToEdit: TimezoneOption) => {
  // const selectedClocks = userClocks.value.filter( clock => clock.tz === clockToEdit.tz )
  selectedTimezone.value = clockToEdit.tz;
  selectedLocations.value = [clockToEdit]

  groupTeamMembers.value = teamMembers.value.filter(member => member.city === clockToEdit.label);

  // isModalVisible.value = false
  // isEditVisible.value = true
}

const handleAddTeamMember = async (teamMember: string) => {

  if (selectedLocations.value.length === 0) return;
  const currentCity = selectedLocations.value[0].label;

  teamMembers.value.push({ name: teamMember, city: currentCity });
}

const handleRemoveTeamMember = async (teamMember: string) => {
  teamMembers.value = teamMembers.value.filter(tm => tm.name !== teamMember)
}

// const removeLocation = async ( locationId ) => {
//
//   userClocks.value = selectedLocations.value.filter(clock => clock.id !== locationId);
//
// }

const handleDeleteClock = async (clockToDelete: TimezoneOption) => {

  userClocks.value = userClocks.value.filter(clock => clock.id !== clockToDelete.id);

};

</script>

<template>
  <div class="main-container"
       tabindex="-1"
       :style="bgStyle"
       :aria-label="`Daily background for ${new Date().toLocaleDateString()}`"
  >
    <div class="min-width-max-container">
      <div class="top-bar-container">

        <ClocksSection
            :clocks="userClocks"
            :teamMembers="teamMembers"
            :weatherData="weatherData"
        />

      </div>
    </div>

    <div>
      <CalendarSection />
<!--      <FooterSection @show-settings-modal="openModal" :attribution="bgAttribution" />-->
      <FooterSection :attribution="bgAttribution" />
    </div>
  </div>

<!--  <transition name="fade">-->
<!--    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-labelledby="modal-title">-->
<!--      <div class="modal-content">-->
<!--        <div class="modal-body">-->
<!--          <div style="display: flex; justify-content: start ; align-items: center; flex-direction: row;">-->
<!--            <h2 id="modal-title" class="modal-title-text">-->
<!--              Add Clock-->
<!--            </h2>-->
<!--            <div style="width: 22px; height: 22px;">-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">-->
<!--                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z" clip-rule="evenodd" />-->
<!--              </svg>-->
<!--            </div>-->
<!--          </div>-->
<!--          <CustomTimezoneAutocomplete-->
<!--              ref="autocompleteComponentRef"-->
<!--              @timezone-selected="handleTimezoneSelection"/>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </transition>-->

  <!--  Div with timezone selector-->
<!--  <transition name="fade">-->
<!--    <div v-if="isEditVisible" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-labelledby="modal-title">-->
<!--      <div class="modal-content-edit">-->
<!--        <div class="modal-header-edit">-->
<!--          Timezone: {{selectedTimezone}}-->
<!--        </div>-->
<!--        <div class="modal-body-edit">-->
<!--          <div style="display: flex; justify-content: start ; align-items: center; flex-direction: row;">-->
<!--            <div class="chip-container" v-if="selectedLocations.length > 0">-->
<!--              <div v-for="location in selectedLocations" :key="location.id" class="chip">-->

<!--                <span>{{ location.label }}</span>-->

<!--                <button-->
<!--                    @click="removeLocation(location.id)"-->
<!--                    class="remove-chip-btn"-->
<!--                    aria-label="Remove location"-->
<!--                >-->
<!--                  &times;-->
<!--                </button>-->

<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="modal-header-edit">-->

<!--          <TagInput :teamMembers="groupTeamMembers" @addTeamMember="handleAddTeamMember" @removeTeamMember="handleRemoveTeamMember"/>-->

<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </transition>-->

<VerticalTabs @drawerOpen="handleDrawerOpen" />

  <SideDrawer
      :is-open="activeDrawer !== null"
      :title="activeDrawer === 'clocks' ? 'Manage Clocks' : 'Manage Bookmarks'"
      @close="handleDrawerClose"
  >
    <div v-if="activeDrawer === 'clocks'">
      <p>Clock management UI goes here.</p>
    </div>
    <div v-if="activeDrawer === 'bookmarks'">
      <p>Bookmark management UI goes here.</p>
    </div>
  </SideDrawer>
</template>

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
