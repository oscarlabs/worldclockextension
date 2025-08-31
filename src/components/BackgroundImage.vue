<template>
  <div class="bg visible" :style="bgStyle"></div>
</template>

<script setup lang="ts">
const IMAGES = [
  'https://images.unsplash.com/photo-1537617173434-be35dd906e61?q=80&w=1459&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1530656131887-4765f003e900?q=80&w=1958&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1593755673003-8ca8dbf906c2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1565690482729-9290df702689?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1701138283117-a400b5100903?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1593964315774-497e84de257a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1740657476863-9fd0dbbbc9c2?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0',
]

// 0 = Sunday ... 6 = Saturday
const dow = new Date().getDay()
const url = IMAGES[dow % IMAGES.length]   // modulo lets you use fewer/more than 7 safely

const bgStyle = { backgroundImage: `url("${url}")` }
</script>

<style scoped>
.bg {
  position: fixed;
  inset: 0;
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #000; /* fallback */
  opacity: 1;
}
</style>
