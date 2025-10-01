// src/composables/mockData.ts

// Make sure to import the Bookmark type from your composable
import type { Bookmark } from '@/composables/useBookmarks'

export const MOCK_BOOKMARKS: Bookmark[] = [
    {
        id: 1,
        url: 'https://vuejs.org/',
        title: 'Vue.js Docs',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=vuejs.org'
    },
    {
        id: 2,
        url: 'https://github.com/',
        title: 'GitHub',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=github.com'
    },
    {
        id: 3,
        url: 'https://figma.com/',
        title: 'Figma - A Very Long Title to Test Ellipsis Overflow',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=figma.com'
    },
    {
        id: 4,
        url: 'https://developer.chrome.com/docs/extensions/',
        title: 'Chrome Extension Docs',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=google.com'
    },
    {
        id: 5,
        url: 'https://tailwindcss.com/',
        title: 'Tailwind CSS',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=tailwindcss.com'
    },
    {
        id: 6,
        url: 'https://vitejs.dev/',
        title: 'Vite',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=vitejs.dev'
    },
    {
        id: 7,
        url: 'https://unsplash.com/',
        title: 'Unsplash - Free Images',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=unsplash.com'
    },
    {
        id: 8,
        url: 'https://supabase.com/',
        title: 'Supabase',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=supabase.com'
    },
    {
        id: 9,
        url: 'https://www.typescriptlang.org/',
        title: 'TypeScript Handbook',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=typescriptlang.org'
    },
    {
        id: 10,
        url: 'https://stackoverflow.com/',
        title: 'Stack Overflow',
        favIconUrl: 'https://www.google.com/s2/favicons?domain=stackoverflow.com'
    }
];