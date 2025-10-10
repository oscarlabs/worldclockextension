// src/composables/useStorage.ts

import { ref, watch, type Ref } from 'vue';

// This composable will be generic, meaning it can handle any type of data (T)
export function useStorage<T>(key: string, defaultValue: T) {

    // This flag determines which storage API to use.
    // In a real app, you might set this based on environment variables.
    // For a Chrome extension, checking for the `chrome` object is robust.
    const isChromeStorage = typeof chrome !== 'undefined' && chrome.storage;

    // Create the reactive state, starting with the default value
    const data: Ref<T> = ref(defaultValue) as Ref<T>;

    // --- PRIVATE FUNCTIONS ---

    // A single function to handle saving data
    const save = async (newValue: T) => {
        try {
            if (isChromeStorage) {
                await chrome.storage.sync.set({ [key]: newValue });
            } else {
                localStorage.setItem(key, JSON.stringify(newValue));
            }
        } catch (error) {
            console.error(`Error saving data for key "${key}":`, error);
        }
    };

    // A single function to handle loading data
    const load = async () => {
        try {
            if (isChromeStorage) {
                const result = await chrome.storage.sync.get({ [key]: defaultValue });
                data.value = result[key];
            } else {
                const storedValue = localStorage.getItem(key);
                data.value = storedValue ? JSON.parse(storedValue) : defaultValue;
            }
        } catch (error) {
            console.error(`Error loading data for key "${key}":`, error);
            data.value = defaultValue; // Fallback to default on error
        }
    };

    // --- EFFECTS ---

    // Watch for any changes to our reactive data and automatically save them.
    // `deep: true` is important for watching changes inside arrays or objects.
    watch(data, (newValue) => {
        save(newValue);
    }, { deep: true });

    // Load the initial data from storage when the composable is first used.
    load();

    // Expose the reactive data to the component
    return {
        data,
    };
}