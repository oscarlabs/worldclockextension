// composables/useDailyBackground.ts
import { ref, readonly, type Ref } from 'vue'
import { getStoredImage, storeImage, cleanupOldImages, cleanupOldWeather, cleanupOldHolidays } from '@/lib/database.service'
import { fetchAndDownloadImage } from '@/lib/unsplash.service'
import { BACKGROUND_IMAGES } from '@/assets/backgrounds'

interface BackgroundAttribution {
    name: string
    url: string
    description: string
    unsplashUrl: string
    locationCity: string
    locationCountry: string
}

interface BackgroundStyle {
    backgroundImage: string
    backgroundSize: string
    backgroundPosition: string
    backgroundRepeat: string
}

interface UserClock {
    label: string
    // Add other clock properties as needed
}

export function useDailyBackground(
    userClocks: Ref<UserClock[]>,
){
    const bgStyle = ref<BackgroundStyle>({
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    });
    const bgAttribution = ref<BackgroundAttribution | null>(null);
    const currentBgUrl = ref<string>(''); // No need for null here

    const setDailyBackground = async (): Promise<void> => {
        // A consistent ID for the day, e.g., '2025-10-08'
        const todayId = new Date().toISOString().split('T')[0]

        // 1. Check IndexedDB first
        const cachedImage = await getStoredImage(todayId)

        if (cachedImage && !bgStyle.value.backgroundImage) {
            // Populate attribution directly from the cached metadata
            bgAttribution.value = {
                name: cachedImage.authorName,
                url: cachedImage.authorUrl,
                description: cachedImage.description ?? '',
                unsplashUrl: cachedImage.unsplashUrl,
                locationCity: cachedImage.locationCity ?? '',
                locationCountry: cachedImage.locationCountry ?? '',
            }
            return
        }

        // 2. If not in DB, fetch from Unsplash
        let query = 'New Zealand Nature' // A nice fallback
        const queryOptions = ['nature', 'city', 'art', 'sightseeing']
        const randomIndex = Math.floor(Math.random() * queryOptions.length)
        const randomOption = queryOptions[randomIndex]

        if (userClocks.value.length > 0) {
            const randomClock =
                userClocks.value[Math.floor(Math.random() * userClocks.value.length)]
            query = randomClock.label.split(',')[0] + ' ' + randomOption
        }

        const newImage = await fetchAndDownloadImage(query)

        if (newImage) {
            // 3. Store the complete package in IndexedDB
            await storeImage({
                id: todayId,
                blob: newImage.blob,
                authorName: newImage.authorName,
                authorUrl: newImage.authorUrl,
                description: newImage.description,
                unsplashUrl: newImage.unsplashUrl,
                locationCity: newImage.locationCity,
                locationCountry: newImage.locationCountry,
            })

            // 4. Display the new image
            currentBgUrl.value = URL.createObjectURL(newImage.blob)
            bgStyle.value = {
                backgroundImage: `url("${currentBgUrl.value}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }
            bgAttribution.value = {
                name: newImage.authorName,
                url: newImage.authorUrl,
                description: newImage.description ?? '',
                unsplashUrl: newImage.unsplashUrl,
                locationCity: newImage.locationCity,
                locationCountry: newImage.locationCountry,
            }

            // 5. Run cleanup in the background
            Promise.all([
                cleanupOldImages(),
                cleanupOldWeather(),
                cleanupOldHolidays(),
            ]).catch(console.error)
        } else {
            // 6. Fallback to static images if the API fails
            const dayOfWeek = new Date().getDay()
            const fallbackUrl =
                BACKGROUND_IMAGES[dayOfWeek % fallbackImages.length]
            bgStyle.value = {
                backgroundImage: `url("${fallbackUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }
        }
    }

    // Cleanup function to revoke object URLs
    const cleanup = () => {
        if (currentBgUrl.value) {
            URL.revokeObjectURL(currentBgUrl.value)
            currentBgUrl.value = ''
        }
    }

    return {
        bgStyle: readonly(bgStyle),
        bgAttribution: readonly(bgAttribution),
        currentBgUrl: readonly(currentBgUrl),
        setDailyBackground,
        cleanup,
    }
}