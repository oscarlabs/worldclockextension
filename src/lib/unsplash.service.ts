export interface UnsplashImage {
    url: string;
    description: string | null;
    authorName: string;
    authorUrl: string;
    unsplashUrl: string;
    locationCity: string | null;
    locationCountry: string | null;
}

// Get the API key from environment variables
// IMPORTANT: For security, replace the hard-coded key with `import.meta.env.VITE_UNSPLASH_ACCESS_KEY`
// and store your key in a .env.local file.
const ACCESS_KEY = '_z5OMCSZCaCju8jmZMKn9Wnin-eSWCaItob60qjtFtI'
const API_BASE_URL = 'https://api.unsplash.com'

/**
 * Fetches a random, high-quality landscape photo from Unsplash based on a query,
 * then fetches its detailed metadata including location.
 * @param {string} query - The search term for the photo (e.g., "Lima", "Tokyo", "nature").
 * @returns {Promise<UnsplashImage | null>} A promise that resolves to an object with image details or null if an error occurs.
 */
export const getBackgroundImage = async (query: string): Promise<UnsplashImage | null> => {
    if (!ACCESS_KEY) {
        console.error("Unsplash Access Key is missing. Please check your .env.local file.");
        return null;
    }

    const searchUrl = `${API_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    try {
        // --- First API Call: Search for a photo to get its ID ---
        const searchResponse = await fetch(searchUrl, {
            headers: {
                Authorization: `Client-ID ${ACCESS_KEY}`,
            },
        });

        if (!searchResponse.ok) {
            throw new Error(`Unsplash search request failed: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
            const photo = searchData.results[0];

            // --- Second API Call: Get detailed data for the specific photo ID ---
            let locationCity: string | null = null;
            let locationCountry: string | null = null;

            const photoDetailsUrl = `${API_BASE_URL}/photos/${photo.id}`;
            const detailsResponse = await fetch(photoDetailsUrl, {
                headers: {
                    Authorization: `Client-ID ${ACCESS_KEY}`,
                },
            });

            if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                if (detailsData.location && detailsData.location.city) {
                    locationCity = detailsData.location.city;
                    locationCountry = detailsData.location.country;
                }
            } else {
                // This is not a critical error, so we just warn and continue
                console.warn(`Could not fetch location details for photo ID: ${photo.id}`);
            }

            // --- Fallback Logic ---
            // If after the details call, we still have no city, use the original query.
            if (!locationCity) {
                // Capitalize the first letter of the query for better display
                locationCity = query.charAt(0).toUpperCase() + query.slice(1);
            }

            // --- Combine data from both calls ---
            return {
                url: photo.urls.full,
                authorName: photo.user.name,
                authorUrl: photo.user.links.html,
                description: photo.description || photo.alt_description,
                unsplashUrl: photo.links.html,
                locationCity: locationCity,
                locationCountry: locationCountry,
            };

        } else {
            console.warn(`No Unsplash results found for query: "${query}"`);
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch image from Unsplash:", error);
        return null;
    }
};