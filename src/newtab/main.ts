// src/main.ts

import { createApp } from 'vue'
import App from './App.vue'
import "../style.css";

// Import the function to get a cached image from your database service
import { getStoredImage } from '../lib/database.service';

/**
 * This is an Immediately Invoked Async Function.
 * It runs right away, before the Vue app is created.
 */
;(async () => {
    // Try to find today's cached background image
    const todayId = new Date().toISOString().split('T')[0];
    const cachedImage = await getStoredImage(todayId);

    // If we find a valid image blob in the cache...
    if (cachedImage?.blob) {
        const objectURL = URL.createObjectURL(cachedImage.blob);
        const appRoot = document.getElementById('app');

        // ...apply it directly to the root div's style.
        if (appRoot) {
            appRoot.style.backgroundImage = `url("${objectURL}")`;
            appRoot.style.backgroundSize = 'cover';
            appRoot.style.backgroundPosition = 'center';
            appRoot.style.backgroundRepeat = 'no-repeat';
        }
    }

    // --- Mount the Vue App ---
    // This line runs only AFTER the pre-loading logic above is complete.
    createApp(App).mount('#app');
})();