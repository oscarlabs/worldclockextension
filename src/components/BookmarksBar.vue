<template>
  <div class="bookmarks-container">
    <div v-if="bookmarks.length > 0" class="bookmarks-wrapper">
      <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item">
        <a :href="bookmark.url" target="_blank" rel="noopener noreferrer" class="bookmark-link">
          <img :src="bookmark.favIconUrl || defaultFavicon" alt="" class="favicon" />
          <span class="bookmark-title">{{ bookmark.title }}</span>
        </a>
        <button @click="emit('delete-bookmark', bookmark.id)" class="delete-btn" aria-label="Delete bookmark">
          &times;
        </button>
      </div>
    </div>
    <div v-else class="empty-state">
      <img src="/icons/bookmark-icon-48.png" alt="Bookmark icon" class="empty-state-icon" />
      <p>No bookmarks yet. Click the extension icon in your toolbar to save a page.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookmark } from '@/composables/useBookmarks';

// A simple fallback favicon (can be a generic globe or bookmark SVG data URL)
const defaultFavicon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0ic2l6ZS02Ij48cGF0aCBkPSJNNy40OTYgMjIuNWMtLjQxNCAwLS44My0uMTY4LTEuMTQ2LS40ODRsLTIuNDQyLTIuNDQyYS43NS43NSAwIDAgMSAwLTEuMDYxbDEuMDYtMS4wNkwxMy43NSAxLjY3NmEuNzUuNzUgMCAwIDEgMS4wNiAwbDcuNDM4IDcuNDM4YS43NS43NSAwIDAgMSAwIDEuMDZMMTAuNDU0IDIxLjA0NmEuNzUuNzUgMCAwIDEtLjUzLjIyNEg3LjQ5NlptMS4zMTUtMi4wNjJoMS41ODJMMTcuNSA0LjgyN2wtMS41ODItMS41ODJMNy4wNjIgMTguNTg4bC0uODc5Ljg3OUg2LjY3OHYtMS41MDNsLjg3OC0uODc5IDEuNDE1IDEuNDE1LTIuMDIgMi4wMnoiIC8+PHBhdGggZD0iTTUuMjUgMTguNzV2LTEuNUg0LjVhLjcuNzUgMCAwIDAgMCAxLjVoLjc1WiIgLz48L3N2Zz4=`;

defineProps<{
  bookmarks: Bookmark[];
}>();

const emit = defineEmits<{
  (e: 'delete-bookmark', id: number): void;
}>();
</script>

/* src/components/BookmarksBar.vue */

<style scoped>
/* Main container to center the wrapper */
.bookmarks-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;


  /* --- ADDED/CHANGED --- */
  position: absolute;      /* Takes the element out of the normal layout flow */
  bottom: 35px;            /* Positions it 35px from the bottom of the wrapper (just above the arrow) */
  left: 50%;               /* Horizontally centers the element */
  transform: translateX(-50%);
}

/* UPDATED: This is the key part for the new layout */
.bookmarks-wrapper {
  display: flex;
  flex-wrap: wrap;          /* ADDED: Allows items to wrap to the next line */
  justify-content: center;  /* ADDED: Centers the items on each line */
  gap: 10px;                /* Space between bookmarks */
  padding: 10px 5px;
  max-width: 95%;         /* Optional: Constrains the width on very large screens */
}

/* REMOVED: All scrollbar styling is gone */

/* Styles for each individual bookmark "chip" */
.bookmark-item {
  background: rgba(25, 25, 25, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 6px 8px 6px 12px;
  flex-shrink: 0;
  max-width: 180px;
  height: 38px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
}

.bookmark-item:hover {
  background: rgba(25, 25, 25, 0.7);
}

.bookmark-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #f5f5f5;
  overflow: hidden;
}

.favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.bookmark-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #f5f5f5;
  opacity: 0.6;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0 0 0 5px;
  transition: opacity 0.2s ease;
  margin-left: 4px;
}

.delete-btn:hover {
  opacity: 1;
}

.empty-state {
  text-align: center;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  padding: 5px 15px;
  background: rgba(25, 25, 25, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>