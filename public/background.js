// A flag to easily switch between storage types.
// true = uses chrome.storage.sync (synced across devices, smaller limit)
// false = uses chrome.storage.local (local to this computer, larger limit)
const USE_SYNC_STORAGE = true;

// Select the appropriate storage area based on the flag
const storageArea = USE_SYNC_STORAGE ? chrome.storage.sync : chrome.storage.local;

const BOOKMARKS_KEY = 'userBookmarks';
const BOOKMARK_LIMIT = 10;

// Listen for when the user clicks the browser action icon
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url || !tab.title) {
        console.error("Cannot bookmark this page.", tab);
        return;
    }

    try {
        // Use the selected storageArea to get bookmarks
        const data = await storageArea.get({ [BOOKMARKS_KEY]: [] });
        const currentBookmarks = data[BOOKMARKS_KEY];

        // 1. Check if we've reached the limit
        if (currentBookmarks.length >= BOOKMARK_LIMIT) {
            console.warn(`Bookmark limit of ${BOOKMARK_LIMIT} reached.`);
            chrome.action.setBadgeText({ text: 'FULL', tabId: tab.id });
            return;
        }

        // 2. Check if the page is already bookmarked
        if (currentBookmarks.some(b => b.url === tab.url)) {
            console.warn("This page is already bookmarked.");
            chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
            return;
        }

        // 3. Create and add the new bookmark
        const newBookmark = {
            id: Date.now(),
            url: tab.url,
            title: tab.title,
            favIconUrl: tab.favIconUrl,
        };

        const updatedBookmarks = [newBookmark, ...currentBookmarks];

        // Use the selected storageArea to set the updated bookmarks
        await storageArea.set({ [BOOKMARKS_KEY]: updatedBookmarks });

        console.log(`Bookmark added successfully to ${USE_SYNC_STORAGE ? 'sync' : 'local'} storage!`);

        // Provide positive visual feedback
        chrome.action.setBadgeText({ text: 'SAVED', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tab.id });

    } catch (error) {
        console.error("Error adding bookmark:", error);
        chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#F44336', tabId: tab.id });
    }

    // Clear the badge after a few seconds for a clean UX
    chrome.alarms.create('clearBadge', { delayInMinutes: 0.05 });
});

// Listener for the alarm to clear the badge
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'clearBadge') {
        chrome.action.setBadgeText({ text: '' });
    }
});