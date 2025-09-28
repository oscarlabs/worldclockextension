// src/lib/weather.service.ts

import { getStoredWeather, storeWeather } from '@/lib/database.service';

// The WeatherInfo interface remains the same
export interface WeatherInfo {
    temp: number;
    description: string;
    icon: string;
}

const API_KEY = '7a8020744b5ec2cb1dc6d22b36349bb8';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// We'll consider weather data stale after 3 hours (in milliseconds)
// For a full day, you could set this to: 24 * 60 * 60 * 1000
const CACHE_DURATION = 3 * 60 * 60 * 1000;

/**
 * Fetches the current weather for a given city, using a cache-first strategy.
 * @param city - The name of the city (e.g., "London").
 * @returns A promise that resolves to a WeatherInfo object or null.
 */
export async function getWeatherForCity(city: string): Promise<WeatherInfo | null> {
    // 1. Check the cache first
    const cachedData = await getStoredWeather(city);
    const now = Date.now();

    // 2. If we have fresh data in the cache, return it immediately
    if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
        // console.log(`Serving weather for ${city} from cache.`);
        return cachedData.weather;
    }

    // 3. If cache is stale or missing, fetch from the API
    // console.log(`Cache stale or missing for ${city}. Fetching from API.`);
    if (!API_KEY) {
        console.error("OpenWeatherMap API key is missing.");
        return null;
    }

    const params = new URLSearchParams({
        q: city,
        appid: API_KEY,
        units: 'metric'
    });

    try {
        const response = await fetch(`${BASE_URL}?${params}`);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        const weatherInfo: WeatherInfo = {
            temp: Math.round(data.main.temp),
            description: data.weather[0]?.description || 'No description',
            icon: data.weather[0]?.icon || '01d',
        };

        // 4. Store the newly fetched data in the cache for next time
        await storeWeather({
            city: city,
            weather: weatherInfo,
            timestamp: Date.now()
        });

        return weatherInfo;

    } catch (error) {
        console.error(`An error occurred while fetching weather for ${city}:`, error);
        // On error, return stale data if we have it, otherwise return null.
        // This provides a better user experience than showing nothing.
        return cachedData?.weather || null;
    }
}