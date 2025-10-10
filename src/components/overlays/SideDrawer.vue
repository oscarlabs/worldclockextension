<template>

    <div v-if="isOpen" class="drawer-overlay" @click.self="close">
      <transition name="slide-fade">
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3>{{ title }}</h3>
          <button @click="close" class="close-btn">&times;</button>
        </div>
        <div class="drawer-content">
          <slot></slot>
        </div>
      </div>
      </transition>
    </div>

</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits(['close']);

const close = () => emit('close');

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close();
};
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1000;
}

/* --- MODIFIED SECTION --- */
.drawer-panel {
  position: fixed;
  /* Instead of top:0, right:0, height:100vh... */
  top: 16px;
  right: 16px;
  bottom: 16px;
  /* This makes the height dynamic and creates the floating effect */

  width: 350px;
  border-radius: 16px; /* <-- ADDED: Rounded corners */

  /* Your existing glass-morphism styles are perfect here */
  background: rgba(25, 25, 25, 0.45);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: -8px 0 32px 0 rgba(0, 0, 0, 0.37);

  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* <-- ADDED: Ensures content respects the border-radius */
}
/* --- END MODIFIED SECTION --- */

.drawer-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent header from shrinking */
}
.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}
.close-btn {
  background: none;
  border: none;
  color: #f5f5f5;
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.close-btn:hover {
  opacity: 1;
}

/* --- MODIFIED ANIMATION --- */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  /* Adjust the transform to account for the new 16px margin */
  transform: translateX(calc(100% + 16px));
}
/* This part of the animation for the overlay remains the same conceptually */
.slide-fade-enter-active .drawer-overlay,
.slide-fade-leave-active .drawer-overlay {
  transition: background-color 0.4s ease;
}
.slide-fade-enter-from .drawer-overlay,
.slide-fade-leave-to .drawer-overlay {
  background-color: transparent;
}
</style>