// src/lib/database.service.ts

import { openDB, type DBSchema } from 'idb';
import type { WeatherInfo } from '@/lib/weather.service';

// --- 1. Define the data structures for our database records ---

export interface ImageCacheRecord {
    id: string; // The date string, e.g., '2025-09-27'
    blob: Blob;
    authorName: string;
    authorUrl: string;
    description: string | null;
    unsplashUrl: string;
    locationCity: string | null;
    locationCountry: string | null;
}

export interface WeatherCacheRecord {
    city: string; // The primary key
    weather: WeatherInfo;
    timestamp: number;
}


// --- 2. Define the database schema ---

const DB_NAME = 'NewTabDB';
const DB_VERSION = 1; // Start with version 1 for the first release
const IMAGE_STORE = 'imageStore';
const WEATHER_STORE = 'weatherCache';

interface AppDBSchema extends DBSchema {
    [IMAGE_STORE]: {
        key: string;
        value: ImageCacheRecord;
    };
    [WEATHER_STORE]: {
        key: string;
        value: WeatherCacheRecord;
    };
}


// --- 3. Initialize the database ---

const dbPromise = openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
    // The 'upgrade' function runs only when the database is first created
    // or when the DB_VERSION number is increased.
    upgrade(db) {
        // console.log('Creating database schema for the first time.');
        // Since this is version 1, we can create both object stores directly.
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
        db.createObjectStore(WEATHER_STORE, { keyPath: 'city' });
    },
});


// --- 4. Service Functions (for interacting with the database) ---

// Image Functions
export const storeImage = async (image: ImageCacheRecord): Promise<void> => {
    const db = await dbPromise;
    await db.put(IMAGE_STORE, image);
};

export const getStoredImage = async (id: string): Promise<ImageCacheRecord | undefined> => {
    const db = await dbPromise;
    return db.get(IMAGE_STORE, id);
};

export const cleanupOldImages = async (): Promise<void> => {
    const db = await dbPromise;
    const allKeys = await db.getAllKeys(IMAGE_STORE);
    allKeys.sort();
    if (allKeys.length > 5) {
        const keysToDelete = allKeys.slice(0, allKeys.length - 5);
        const tx = db.transaction(IMAGE_STORE, 'readwrite');
        for (const key of keysToDelete) {
            tx.store.delete(key);
        }
        await tx.done;
    }
};

// Weather Functions
export const storeWeather = async (data: WeatherCacheRecord): Promise<void> => {
    const db = await dbPromise;
    await db.put(WEATHER_STORE, data);
};

export const getStoredWeather = async (city: string): Promise<WeatherCacheRecord | undefined> => {
    const db = await dbPromise;
    return db.get(WEATHER_STORE, city);
};

// --- ADD THIS NEW FUNCTION ---
/**
 * Cleans up old weather entries from the database that are older than 24 hours.
 */
export const cleanupOldWeather = async (): Promise<void> => {
    const db = await dbPromise;
    const allWeather = await db.getAll(WEATHER_STORE);

    // Set the cutoff time to 24 hours ago
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    const keysToDelete = allWeather
        .filter(entry => entry.timestamp < oneDayAgo)
        .map(entry => entry.city);

    if (keysToDelete.length > 0) {
        const tx = db.transaction(WEATHER_STORE, 'readwrite');
        for (const key of keysToDelete) {
            tx.store.delete(key);
        }
        await tx.done;
        // console.log(`Cleaned up ${keysToDelete.length} old weather cache entries.`);
    }
};