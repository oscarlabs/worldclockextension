<template>
  <div class="main-container" :style="bgStyle" :aria-label="`Daily background for ${new Date().toLocaleDateString()}`">
    <div class="min-width-max-container">
      <div class="top-bar-container">

        <Clock />

      </div>
    </div>

    <div>
      <Calendar />
      <Footer />
    </div>
  </div>

</template>

<script setup lang="ts">
import {onMounted, onUnmounted, Ref, ref} from 'vue'
import Clock from "@/components/Clock.vue";
import Calendar from "@/components/Calendar.vue";
import Footer from "@/components/Footer.vue";
import { BACKGROUND_IMAGES } from '@/assets/backgrounds'

const bgStyle: Ref<Record<string, string>> = ref({})

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
  gap: 0.375rem;  /* 6px */
  justify-content: flex-start;
  z-index: 5;
}

</style>
