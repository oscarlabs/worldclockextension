// This new interface includes the image Blob data
export interface UnsplashResponse {
    blob: Blob;
    description: string | null;
    authorName: string;
    authorUrl: string;
    unsplashUrl: string;
    locationCity: string | null;
    locationCountry: string | null;
}

const ACCESS_KEY = '_z5OMCSZCaCju8jmZMKn9Wnin-eSWCaItob60qjtFtI'
const API_BASE_URL = 'https://api.unsplash.com'

/**
 * Fetches photo metadata from Unsplash and then downloads the image data as a Blob.
 * @param {string} query - The search term for the photo.
 * @returns {Promise<UnsplashResponse | null>} A promise resolving to the image data and metadata.
 */
export const fetchAndDownloadImage = async (query: string): Promise<UnsplashResponse | null> => {
    if (!ACCESS_KEY) {
        console.error("Unsplash Access Key is missing.");
        return null;
    }

    const searchUrl = `${API_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    try {
        // --- Step 1: Search for a photo to get its ID and basic info ---
        const searchResponse = await fetch(searchUrl, {
            headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        });
        if (!searchResponse.ok) throw new Error(`Unsplash search failed: ${searchResponse.statusText}`);

        const searchData = await searchResponse.json();
        if (!searchData.results || searchData.results.length === 0) {
            console.warn(`No Unsplash results for query: "${query}"`);
            return null;
        }

        const photo = searchData.results[0];

        // --- Step 2: Get detailed data for location ---
        let locationCity: string | null = null;
        let locationCountry: string | null = null;

        const detailsResponse = await fetch(`${API_BASE_URL}/photos/${photo.id}`, {
            headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        });

        if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData.location?.city) {
                locationCity = detailsData.location.city;
                locationCountry = detailsData.location.country;
            }
        } else {
            console.warn(`Could not fetch location for photo ID: ${photo.id}`);
        }

        if (!locationCity) {
            locationCity = query.charAt(0).toUpperCase() + query.slice(1);
        }

        // --- Step 3: Download the actual image data ---
        const imageResponse = await fetch(photo.urls.full);
        if (!imageResponse.ok) throw new Error(`Failed to download image from ${photo.urls.full}`);

        const imageBlob = await imageResponse.blob();

        // --- Step 4: Return the complete package ---
        return {
            blob: imageBlob,
            authorName: photo.user.name,
            authorUrl: photo.user.links.html,
            description: photo.description || photo.alt_description,
            unsplashUrl: photo.links.html,
            locationCity: locationCity,
            locationCountry: locationCountry,
        };

    } catch (error) {
        console.error("Failed to fetch or download image from Unsplash:", error);
        return null;
    }
};

