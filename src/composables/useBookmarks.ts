// src/composables/useBookmarks.ts

import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { MOCK_BOOKMARKS } from '@/assets/mockData';

// Define a clear type for our bookmark objects
export interface Bookmark {
    id: number; // Simple unique ID
    url: string;
    title: string;
    favIconUrl?: string; // Favicon is optional
}

// Define our storage key and limit as constants
const BOOKMARKS_KEY = 'userBookmarks';
const BOOKMARK_LIMIT = 10;

export function useBookmarks() {
    // Reactive state for our bookmarks
    const bookmarks: Ref<Bookmark[]> = ref(MOCK_BOOKMARKS);
    const isLoading: Ref<boolean> = ref(true);

    /**
     * Loads bookmarks from chrome.storage.sync on initialization.
     */
    const loadBookmarks = async () => {
        // try {
        //     const result = await chrome.storage.sync.get({ [BOOKMARKS_KEY]: [] });
        //     bookmarks.value = result[BOOKMARKS_KEY];
        // } catch (error) {
        //     console.error('Error loading bookmarks:', error);
        // } finally {
        //     isLoading.value = false;
        // }
    };

    /**
     * Saves the current bookmarks array to chrome.storage.sync.
     */
    const saveBookmarks = async () => {
        try {
            await chrome.storage.sync.set({[BOOKMARKS_KEY]: bookmarks.value});
        } catch (error) {
            console.error('Error saving bookmarks:', error);
            // Here you could add user feedback if the save fails (e.g., quota exceeded)
        }
    }

    /**
     * Adds the current active tab as a new bookmark.
     */
    const addCurrentTabAsBookmark = async () => {
        if (bookmarks.value.length >= BOOKMARK_LIMIT) {
            alert(`You've reached the bookmark limit of ${BOOKMARK_LIMIT}.`);
            return;
        }

        try {
            // Query for the active tab in the current window
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tab && tab.url) {
                // Check if the bookmark already exists
                if (bookmarks.value.some(b => b.url === tab.url)) {
                    console.warn('This page is already bookmarked.');
                    // Optionally, provide user feedback here
                    return;
                }

                const newBookmark: Bookmark = {
                    id: Date.now(), // Using timestamp for a simple unique ID
                    url: tab.url,
                    title: tab.title || 'Untitled',
                    favIconUrl: tab.favIconUrl,
                };

                bookmarks.value.unshift(newBookmark); // Add to the beginning of the list
                await saveBookmarks();
            }
        } catch (error) {
            console.error('Could not add bookmark:', error);
        }
    };

    /**
     * Deletes a bookmark by its ID.
     * @param {number} bookmarkId - The ID of the bookmark to remove.
     */
    const deleteBookmark = async (bookmarkId: number) => {
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
        await saveBookmarks();
    };

// Load bookmarks when the composable is first used
//     onMounted(loadBookmarks);

// Expose the state and methods to the component
    return {
        bookmarks,
        isLoading,
        addCurrentTabAsBookmark,
        deleteBookmark,
    };
}