<script setup lang="ts">
import { ref } from 'vue'
import Clock from "@/icons/Clock.vue";
import Bookmark from "@/icons/Bookmark.vue";

const props = defineProps(['activeDrawer'])

const emit = defineEmits(['drawerOpen'])

function emitDrawerOpen(drawerName: string){
  emit('drawerOpen', drawerName)
}

</script>

<template>

  <div class="vertical-tabs">

    <button @click="emitDrawerOpen('bookmarks')" :class="{ active: props.activeDrawer === 'bookmarks' }" aria-label="Manage Bookmarks">
      <div class="tab-content">
        <Bookmark class="tab-icon" />
        <span class="tab-text">Bookmarks</span>
      </div>
    </button>

    <button @click="emitDrawerOpen('clocks')" :class="{ active: props.activeDrawer === 'clocks' }" aria-label="Manage Clocks">
      <div class="tab-content">
        <Clock class="tab-icon" />
        <span class="tab-text">Clocks</span>
      </div>
    </button>
  </div>

</template>

<style scoped>

.vertical-tabs {
  position: fixed;
  top: 70%;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 999;
}

.vertical-tabs button {
  width: 45px;
  padding: 16px 8px;

  transform: translateX(10px);

  background: rgba(25, 25, 25, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-right: none;
  border-radius: 16px 0 0 16px;

  color: white;
  cursor: pointer;

  transition: all 0.3s ease;
}

.vertical-tabs button:hover {
  background: rgba(25, 25, 25, 0.7);
  transform: translateX(0);

}

.vertical-tabs button.active {
  background: rgba(59, 130, 246, 0.5);
  transform: translateX(0);
}

.tab-content {
  display: flex;
  align-items: center; /* Center items along the horizontal axis */
  gap: 8px;

  /* Apply writing mode and rotation to the ENTIRE container */
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.tab-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  transform: rotate(90deg);
}

.tab-text {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>