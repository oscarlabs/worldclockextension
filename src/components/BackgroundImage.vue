<template>
  <div class="bg" :style="styleObj" :class="{ visible: isVisible }"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isVisible = ref(false)
const styleObj = ref<Record<string, string>>({})

async function loadImage() {
  // daily cache key
  const todayKey = new Date().toISOString().slice(0,10)
  const cacheKey = `bg_${todayKey}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    styleObj.value = { backgroundImage: `url(${cached})` }
    isVisible.value = true
    return
  }
  // fetch Unsplash random landscape
  const url = 'https://source.unsplash.com/1600x900/?landscape,nature'
  try {
    const resUrl = url // for this endpoint, the final image URL is the request itself
    styleObj.value = { backgroundImage: `url(${resUrl})` }
    isVisible.value = true
    localStorage.clear() // clear older cached bg keys
    localStorage.setItem(cacheKey, resUrl)
  } catch (e) {
    console.error('Background load failed', e)
  }
}

onMounted(loadImage)
</script>

<style scoped>
.bg {
  position: fixed; inset: 0; z-index: 1;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  filter: brightness(1);
  opacity: 0; transition: opacity .4s ease;
}
.bg.visible { opacity: 1; }
</style>
