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
} = useClocks(userClocks, teamMembers)

const { bgStyle, bgAttribution, currentBgUrl, setDailyBackground, cleanup } = useDailyBackground(userClocks)
const { weatherData } = useWeather(userClocks);

import type { TimezoneOption } from '@/assets/world_timezone'


// AQUI AQUI 1 LINEA
// const groupTeamMembers = ref<TeamMember[]>([]);

import { useBookmarks } from '@/composables/useBookmarks'
import ClocksDrawer from "@/components/overlays/ClocksDrawer.vue";

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

const hanleUpdateClocks = (updatedClocks) => {
  userClocks.value = updatedClocks
}

const hanleUpdateTeamMembers = (updatedMembers) => {
  teamMembers.value = updatedMembers
}

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
      <ClocksDrawer
          :clocks="userClocks"
          :teamMembers="teamMembers"
          @update-clocks="hanleUpdateClocks"
          @update-teammembers="hanleUpdateTeamMembers"
      />
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

</style>
