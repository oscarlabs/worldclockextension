// src/composables/useWeather.ts

import { ref, readonly, watch, type Ref } from 'vue';
import { getWeatherForCity, type WeatherInfo } from '@/lib/weather.service';
import type { TimezoneOption } from '@/assets/world_timezone';

export function useWeather(userClocks: Ref<TimezoneOption[]>) {
    const weatherData = ref<Map<string, WeatherInfo | null>>(new Map());

    // This simplified watcher is more robust.
    // { immediate: true } makes it run once as soon as the composable is used.
    watch(userClocks, (currentClocks) => {
        // console.log('[useWeather] Watcher fired. Processing clocks:', currentClocks);

        if (!currentClocks || currentClocks.length === 0) {
            return; // Nothing to process
        }

        // Iterate over all current clocks
        currentClocks.forEach(clock => {
            // Fetch weather only if we don't already have it in our map
            if (!weatherData.value.has(clock.label)) {
                // console.log(`[useWeather] Fetching weather for new/initial clock: ${clock.label}`);

                // Call getWeatherForCity and update the map when the promise resolves
                getWeatherForCity(clock.label).then(data => {
                    if (data) {
                        weatherData.value.set(clock.label, data);
                    }
                });
            }
        });

    }, { deep: true, immediate: true });

    return {
        weatherData: readonly(weatherData),
    };
}