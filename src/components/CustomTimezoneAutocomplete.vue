<template>
  <div class="autocomplete-root" ref="rootEl">
    <input
        type="text"
        class="autocomplete-input"
        :value="searchQuery"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @keydown.esc.prevent="onEscape"
        placeholder="Search for a city..."
    />

    <Teleport to="body">
      <Transition name="fade">
        <ul
            v-if="isOpen"
            class="autocomplete-dropdown"
            :style="dropdownStyle"
            ref="dropdownEl"
        >
          <li v-if="filteredTimezones.length === 0" class="autocomplete-item-empty">
            No results found.
          </li>
          <li
              v-for="(timezone, index) in filteredTimezones"
              :key="timezone.id"
              class="autocomplete-item"
              :class="{ 'item-active': index === activeIndex }"
              @mousedown.prevent="selectTimezone(timezone)"
          >
            {{ timezone.label }}
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type CSSProperties } from 'vue';
import { timezones, type TimezoneOption } from '@/assets/world_timezone';

// Use Vue 3.4+ 'defineModel' for the cleanest v-model implementation
const model = defineModel<TimezoneOption | null>();

// --- Component State ---
const isOpen = ref(false);
const searchQuery = ref('');
const activeIndex = ref(-1);

// Template Refs for positioning
const rootEl = ref<HTMLDivElement | null>(null);
const dropdownEl = ref<HTMLUListElement | null>(null);

// --- Dropdown Positioning State ---
const dropdownStyle = ref<CSSProperties>({});

// --- Core Logic ---
const filteredTimezones = computed(() => {
  // If the search query is empty, show the first 10 timezones as suggestions.
  if (searchQuery.value === '') {
    return timezones.slice(0, 10);
  }

  // Otherwise, filter based on the user's input.
  return timezones.filter(tz =>
      tz.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// --- Event Handlers ---
const onInput = (event: Event) => {
  isOpen.value = true;
  activeIndex.value = -1; // Reset selection on new input
  searchQuery.value = (event.target as HTMLInputElement).value;
};

const onFocus = () => {
  isOpen.value = true;
};

const onBlur = () => {
  // We use a small timeout to allow a click on a dropdown item to register
  // before the dropdown is closed.
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
};

const selectTimezone = (timezone: TimezoneOption) => {
  model.value = timezone;
  searchQuery.value = timezone.label; // Update input text to match selection
  isOpen.value = false;
};

const onEscape = () => {
  isOpen.value = false;
};

// --- Keyboard Navigation ---
const onArrowDown = () => {
  if (activeIndex.value < filteredTimezones.value.length - 1) {
    activeIndex.value++;
  } else {
    activeIndex.value = 0; // Wrap around to the top
  }
  scrollToActiveItem();
};

const onArrowUp = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  } else {
    activeIndex.value = filteredTimezones.value.length - 1; // Wrap around to the bottom
  }
  scrollToActiveItem();
};

const onEnter = () => {
  if (activeIndex.value >= 0 && filteredTimezones.value[activeIndex.value]) {
    selectTimezone(filteredTimezones.value[activeIndex.value]);
  }
};

// --- Positioning and Effects ---

// Function to calculate and set dropdown position
const calculatePosition = () => {
  if (!isOpen.value || !rootEl.value) return;

  const rect = rootEl.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'absolute', // or 'fixed' if you prefer
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
  };
};

const scrollToActiveItem = async () => {
  await nextTick(); // Wait for DOM to update with the new 'active' class
  if (dropdownEl.value) {
    const activeItem = dropdownEl.value.querySelector('.item-active');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }
};

// When the model is updated from the parent, sync the input text
watch(model, (newValue) => {
  searchQuery.value = newValue?.label || '';
});

// Watch for the dropdown opening to calculate its position
watch(isOpen, (newValue) => {
  if (newValue) {
    // Use nextTick to ensure the input element is in its final state
    // before we measure its position.
    nextTick(calculatePosition);
  }
});

// Add/remove resize listener to reposition dropdown if window changes
onMounted(() => {
  window.addEventListener('resize', calculatePosition);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', calculatePosition);
});
</script>

<style scoped>
.autocomplete-root {
  position: relative;
  width: 300px;

  border: 2px solid #fff;
  border-radius: 0.375rem;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* For Safari */
  background: rgba(0,0,0,0.28) !important;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden; /* This is key to contain the input's corners */
}

.autocomplete-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;

  /* REMOVING THESE STYLES */
  /* border: 1px solid #d1d5db; */
  /* border-radius: 0.375rem; */
  /* transition: border-color 0.2s, box-shadow 0.2s; */

  /* MAKE THE INPUT TRANSPARENT */
  border: none;
  background-color: transparent;
  outline: none; /* The focus ring is now on the parent */

  box-sizing: border-box;

  color: #ffffff;
  font-weight: bold;
}

.autocomplete-input::placeholder {
  color: #ffffff;
  opacity: 1; /* Override browser defaults for a solid color */
}

/* These styles apply to the Teleported element */
.autocomplete-dropdown {
  padding: 0.5rem 0;
  margin: 4px 0 0 0; /* A small gap from the input */
  list-style: none;
  background: rgba(0,0,0,0.4) !important;
  opacity: 0.8;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 99999; /* High z-index to appear over everything */
}

.autocomplete-item, .autocomplete-item-empty {
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
}

.autocomplete-item-empty {
  color: #6b7280;
  cursor: default;
}

.autocomplete-item.item-active {
  background-color: #3b82f6;
  color: white;
}

/* Simple fade transition for the dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>