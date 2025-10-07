// src/lib/holiday.service.ts

import { timezones, type TimezoneOption } from '@/assets/world_timezone';
import { getStoredHoliday, storeHoliday, type NagerHoliday } from './database.service';

// --- NEW: Timezone-aware date function ---
/**
 * Gets the current date formatted as YYYY-MM-DD in a specific timezone.
 * @param tz The IANA timezone string (e.g., 'America/La_Paz')
 */
const getTodayDateStringForTimezone = (tz: string): string => {
    const today = new Date();
    // Use Intl.DateTimeFormat to get date parts in the target timezone
    // The 'en-CA' locale is a reliable way to get YYYY-MM-DD parts.
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(today);

    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
    // return '2025-08-06';
};


/**
 * Gets today's public holiday for a given location ID.
 * ... (rest of the comment is the same)
 */
export const getHolidayForLocation = async (locationId: number): Promise<string | null> => {
    const location: TimezoneOption | undefined = timezones.find(tz => tz.id === locationId);
    if (!location) {
        console.error(`Location with ID ${locationId} not found.`);
        return null;
    }

    const { countryCode, region, tz } = location;
    const year = new Date().getFullYear();

    // --- THE FIX: Use the new timezone-aware function ---
    const todayDateString = getTodayDateStringForTimezone(tz);

    const cacheKey = `${countryCode}-${year}`;
    let allHolidaysForYear: NagerHoliday[] = [];

    const cachedYear = await getStoredHoliday(cacheKey);
    if (cachedYear) {
        allHolidaysForYear = cachedYear.holidays;
    } else {
        try {
            const apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Nager API responded with status: ${response.status}`);
            }

            const holidayData: NagerHoliday[] = await response.json();
            allHolidaysForYear = holidayData;

            await storeHoliday({
                id: cacheKey,
                holidays: allHolidaysForYear,
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error(`Failed to fetch holiday data for ${countryCode}:`, error);
            return null;
        }
    }

    if (allHolidaysForYear.length === 0) {
        return null;
    }

    const todaysHoliday = allHolidaysForYear.find(h => h.date === todayDateString);

    if (!todaysHoliday) {
        return null;
    }

    const isNationalHoliday = todaysHoliday.counties === null;
    const isApplicableRegionalHoliday = Array.isArray(todaysHoliday.counties) && region
        ? todaysHoliday.counties.includes(region)
        : false;

    if (isNationalHoliday || isApplicableRegionalHoliday) {
        return todaysHoliday.localName;
    }

    return null;
};