import { openDB, type IDBPDatabase } from 'idb';

// This interface defines the complete data package we'll store.
export interface StoredImage {
    id: string; // The date string, e.g., '2025-09-27'
    blob: Blob;
    authorName: string;
    authorUrl: string;
    description: string | null;
    unsplashUrl: string;
    locationCity: string | null;
    locationCountry: string | null;
}

const DB_NAME = 'ImageCacheDB';
const STORE_NAME = 'BackgroundImages';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

// Initializes the database and creates the object store if needed.
const initDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
    return dbPromise;
};

/**
 * Stores an image blob and its metadata in IndexedDB.
 * @param {StoredImage} image The complete image object to store.
 */
export const storeImage = async (image: StoredImage): Promise<void> => {
    const db = await initDB();
    await db.put(STORE_NAME, image);
    // console.log(`Image for ${image.id} stored in IndexedDB.`);
};

/**
 * Retrieves a stored image from IndexedDB by its date ID.
 * @param {string} id The date ID of the image to retrieve.
 * @returns {Promise<StoredImage | undefined>} The stored image object, or undefined if not found.
 */
export const getStoredImage = async (id: string): Promise<StoredImage | undefined> => {
    const db = await initDB();
    return db.get(STORE_NAME, id);
};

/**
 * Cleans up old images from the database to save space, keeping the most recent 5.
 */
export const cleanupOldImages = async (): Promise<void> => {
    const db = await initDB();
    const allKeys = await db.getAllKeys(STORE_NAME);
    // Sort keys to ensure we delete the oldest ones
    allKeys.sort();
    if (allKeys.length > 5) {
        const keysToDelete = allKeys.slice(0, allKeys.length - 5);
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const key of keysToDelete) {
            tx.store.delete(key);
        }
        await tx.done;
        // console.log(`Cleaned up ${keysToDelete.length} old cached images.`);
    }
};
