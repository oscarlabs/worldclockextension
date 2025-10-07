// src/lib/database.service.ts

import { openDB, type DBSchema } from 'idb';
import type { WeatherInfo } from '@/lib/weather.service';

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

export interface NagerHoliday {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    counties: string[] | null;
    launchYear: number | null;
    types: string[];
}

// This is the structure we will store in IndexedDB
export interface HolidayCacheRecord {
    id: string; // Composite key: `${countryCode}-${year}` e.g., "US-2025"
    holidays: NagerHoliday[]; // The full array of holidays for that year
    timestamp: number;
}

const DB_NAME = 'NewTabDB';
const DB_VERSION = 3;
const IMAGE_STORE = 'imageStore';
const WEATHER_STORE = 'weatherCache';
const HOLIDAY_STORE = 'holidayCache';

interface AppDBSchema extends DBSchema {
    [IMAGE_STORE]: {
        key: string;
        value: ImageCacheRecord;
    };
    [WEATHER_STORE]: {
        key: string;
        value: WeatherCacheRecord;
    };
    [HOLIDAY_STORE]: {
        key: string;
        value: HolidayCacheRecord;
    };
}

const dbPromise = openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
        // This structure ensures smooth upgrades in the future.
        if (oldVersion < 1) {
            db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
            db.createObjectStore(WEATHER_STORE, { keyPath: 'city' });
        }

        // The old v2 holiday store is now obsolete.
        // We handle its removal in the v3 upgrade.
        if (oldVersion < 2) {
            // No action needed here for v2, as v3 will handle the migration.
        }

        // --- NEW: Handle the migration to the efficient holiday cache ---
        if (oldVersion < 3) {
            // If the old holiday store from v2 exists, delete it.
            if (db.objectStoreNames.contains(HOLIDAY_STORE)) {
                db.deleteObjectStore(HOLIDAY_STORE);
            }
            // Create the new, improved holiday store.
            db.createObjectStore(HOLIDAY_STORE, { keyPath: 'id' });
        }
    },
});

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

/**
 * Stores holiday information in the database.
 */
export const storeHoliday = async (data: HolidayCacheRecord): Promise<void> => {
    const db = await dbPromise;
    await db.put(HOLIDAY_STORE, data);
};

/**
 * Retrieves stored holiday information from the database by its composite key.
 */
export const getStoredHoliday = async (id: string): Promise<HolidayCacheRecord | undefined> => {
    const db = await dbPromise;
    return db.get(HOLIDAY_STORE, id);
};

/**
 * Cleans up holiday entries older than 2 days.
 */
export const cleanupOldHolidays = async (): Promise<void> => {
    const db = await dbPromise;
    const allHolidays = await db.getAll(HOLIDAY_STORE);
    const currentYear = new Date().getFullYear();

    const keysToDelete = allHolidays
        .filter(entry => {
            // Safely parse the year from the ID, e.g., "US-2025" -> 2025
            const yearStr = entry.id.split('-')[1];
            const year = yearStr ? parseInt(yearStr, 10) : 0;
            return year < currentYear;
        })
        .map(entry => entry.id);

    if (keysToDelete.length > 0) {
        const tx = db.transaction(HOLIDAY_STORE, 'readwrite');
        for (const key of keysToDelete) {
            tx.store.delete(key);
        }
        await tx.done;
        // console.log(`Cleaned up ${keysToDelete.length} old holiday cache entries.`);
    }
};