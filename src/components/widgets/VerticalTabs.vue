<script setup lang="ts">
import { ref } from 'vue'

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
        <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        <span class="tab-text">Bookmarks</span>
      </div>
    </button>

    <button @click="emitDrawerOpen('clocks')" :class="{ active: props.activeDrawer === 'clocks' }" aria-label="Manage Clocks">
      <div class="tab-content">
        <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.41l-1.028.927c-.24.217-.386.519-.386.834v.28c0 .315.146.617.386.834l1.028.927a1.125 1.125 0 01.242 1.41l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.41l1.028-.927c.24-.217.386-.519.386-.834v-.28c0-.315-.146-.617-.386-.834l-1.028-.927a1.125 1.125 0 01-.242-1.41l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124a6.57 6.57 0 01.22-.127c.332.183.582.495.645.87l.213 1.281z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="tab-text">Settings</span>
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