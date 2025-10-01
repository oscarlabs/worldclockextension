// src/composables/useSettings.ts
import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';

const SETTINGS_KEY = 'userSettings';

export interface UserSettings {
    language: 'en' | 'es' | 'pt';
}

export function useSettings() {
    const settings: Ref<UserSettings> = ref({ language: 'en' });

    const loadSettings = async () => {
        const data = await chrome.storage.sync.get(SETTINGS_KEY);
        if (data[SETTINGS_KEY]) {
            settings.value = data[SETTINGS_KEY];
        }
    };

    const saveSettings = async (newSettings: UserSettings) => {
        settings.value = newSettings;
        await chrome.storage.sync.set({ [SETTINGS_KEY]: newSettings });
    };

    onMounted(loadSettings);

    return {
        settings,
        saveSettings,
    };
}