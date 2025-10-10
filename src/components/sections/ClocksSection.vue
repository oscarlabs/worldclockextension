<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getWeatherForCity, type WeatherInfo } from '@/lib/weather.service'
import { getHolidayForLocation } from '@/lib/holiday.service' // <--- 1. IMPORT THE NEW SERVICE
import PartyHorn from "@/icons/PartyHorn.vue";

// --- PROPS & EMITS ---
const props = defineProps<{
  clocks: ClockCfg[]
  teamMembers: TeamMember[]
  weatherData: ReadonlyMap<string, WeatherInfo | null>
}>()

const emit = defineEmits<{
  (e: 'editClock', clock: ClockCfg): void      // Now emits a single ClockCfg
  (e: 'deleteClock', clock: ClockCfg): void  // Now emits a single ClockCfg
  (e: 'showSettingsModal'): void
}>()

// --- TYPES ---
type ClockCfg = { id: number; label: string; tz: string }
type TeamMember = { name: string; city: string } // Note: TeamMember now links to a city

// --- CORE STATE & HELPERS ---
const homeTz = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima')
const now = ref(new Date())
let handle: number | undefined
onMounted(() => { handle = window.setInterval(() => { now.value = new Date() }, 30_000) })
onUnmounted(() => { if (handle) clearInterval(handle) })

// --- NEW: HOLIDAY DATA LOGIC --- // <--- 2. ADD THIS SECTION
const holidayData = ref(new Map<number, string | null>());
const isLoadingHolidays = ref(false);

// --- NEW `sortedClocks` COMPUTED PROPERTY ---
// This replaces the old `groups` computed property.
// We now work with the clocks array directly.
const sortedClocks = computed(() => {
  // Create a mutable copy before sorting
  const arr = [...props.clocks];

  arr.sort((a, b) => {
    const dayDiff = dayDelta(a.tz) - dayDelta(b.tz)
    if (dayDiff !== 0) return dayDiff

    const timeA = fmtTime24h(now.value, a.tz)
    const timeB = fmtTime24h(now.value, b.tz)
    return timeA.localeCompare(timeB)
  })

  return arr;
});

const timeFmt24hCache = new Map<string, Intl.DateTimeFormat>()

function fmtTime24h(d: Date, tz: string) {
  const k = `24h|${tz}` // Use a simple key
  if (!timeFmt24hCache.has(k)) {
    // Using 'en-GB' locale is a reliable way to get a 24-hour HH:mm format
    timeFmt24hCache.set(k, new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: tz
    }))
  }
  return timeFmt24hCache.get(k)!.format(d) // Returns "09:30", "14:15", etc.
}

/**
 * Determines if it's day or night based on a 24-hour time string.
 * Assumes 'day' is from 6:00 (inclusive) to 18:00 (exclusive).
 *
 * @param {string | undefined | null} time24h - The time in "HH:MM" format (e.g., "09:30", "21:15").
 * @returns {'day' | 'night'} - The period of the day. Defaults to 'night' on invalid input.
 */
function isDayOrNight(time24h) {
  // Guard against null or undefined input
  if (!time24h) {
    return 'night';
  }

  // Extract the hour part of the string and convert it to an integer.
  // Using parseInt is safe and efficient.
  const hour = parseInt(time24h.substring(0, 2), 10);

  // Check if parsing was successful
  if (isNaN(hour)) {
    return 'night';
  }

  // Check if the hour falls within the daytime range (6 AM to 5:59 PM)
  if (hour >= 6 && hour < 18) {
    return 'day';
  } else {
    return 'night';
  }
}

// Intl helpers (cache formatters per tz)
const locale = navigator.language || 'en-US'
// const timeFmtCache = new Map<string, Intl.DateTimeFormat>()

// function fmtFor(tz: string) {
//   const k = `${locale}|${tz}|12h`
//   if (!timeFmtCache.has(k)) {
//     timeFmtCache.set(k, new Intl.DateTimeFormat(locale, {
//       hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz
//     }))
//   }
//   return timeFmtCache.get(k)!
// }

function formatTime(d: Date, tz: string) {
  // return fmtFor(tz).format(d)
  return fmtTime24h(d, tz)
}

// Zone name/offset (short like PST / GMT-05:00)
// Use 'short' to get e.g. "PDT", or 'shortOffset' to get "GMT-07:00"
const tzNameCache = new Map<string, Intl.DateTimeFormat>()
function tzNameFmtFor(tz: string, mode: 'short' | 'shortOffset' = 'short') {
  const k = `${locale}|${tz}|${mode}`
  if (!tzNameCache.has(k)) {
    tzNameCache.set(k, new Intl.DateTimeFormat(locale, {
      timeZone: tz, timeZoneName: mode
    }))
  }
  return tzNameCache.get(k)!
}

// --- helpers to avoid duplicate "GMT+X GMT+X" ---
function tzPart(tz: string, mode: 'short' | 'shortOffset') {
  return tzNameFmtFor(tz, mode)
      .formatToParts(now.value)
      .find(p => p.type === 'timeZoneName')?.value ?? ''
}

// Normalize "GMT+01:00" -> "GMT+1", keep minutes if non-zero (e.g., "GMT+5:30", "GMT+12:45")
function normalizeOffset(s: string) {
  const m = /^GMT([+-])0?(\d{1,2}):(\d{2})$/.exec(s)
  if (!m) return s // already "GMT" or locale-specific, return as-is
  const [, sign, hh, mm] = m
  return mm === '00' ? `GMT${sign}${parseInt(hh, 10)}` : `GMT${sign}${parseInt(hh, 10)}:${mm}`
}

// Show abbrev only if it looks like letters (EDT/CEST) and not equal to the offset
function displayAbbr(tz: string) {
  const a = tzPart(tz, 'short')         // e.g., "EDT" or "GMT+1"
  const o = normalizeOffset(tzPart(tz, 'shortOffset'))
  const looksLikeLetters = /^[A-Z]{2,6}$/.test(a)
  return looksLikeLetters && a !== o ? a : ''   // hide if it's just another GMT string
}

// function displayOffset(tz: string) {
//   return normalizeOffset(tzPart(tz, 'shortOffset'))
// }
//
// function zoneName(tz: string, mode: 'short' | 'shortOffset' = 'short') {
//   const parts = tzNameFmtFor(tz, mode).formatToParts(now.value)
//   return parts.find(p => p.type === 'timeZoneName')?.value ?? ''
// }

// Key used for grouping
// function zoneKey(tz: string) {
//   if (groupBy.value === 'zone') return tz // stable across seasons
//   // Offset grouping: changes with DST; good if you want cards to merge
//   return zoneName(tz, 'shortOffset') // e.g. "GMT-05:00"
// }

// Merge cities that share the same key (zone or current offset)
// type Group = { key: string; labels: string[]; tz: string }
//
// const groups = computed<Group[]>(() => {
//   const map = new Map<string, Group>()
//   for (const c of props.clocks) {
//     const key = zoneKey(c.tz)
//     const g = map.get(key) || { key, labels: [], tz: c.tz }
//     g.labels.push(c.label)
//     map.set(key, g)
//   }
//
//   const arr = Array.from(map.values())
//
//   arr.sort((a, b) => {
//     // 1. Primary Sort: by day difference (-1, 0, 1)
//     const dayDiff = dayDelta(a.tz) - dayDelta(b.tz)
//     if (dayDiff !== 0) {
//       return dayDiff
//     }
//
//     // 2. Secondary Sort: by 24-hour time
//     // String comparison works perfectly for "HH:mm" format
//     const timeA = fmtTime24h(now.value, a.tz)
//     const timeB = fmtTime24h(now.value, b.tz)
//     return timeA.localeCompare(timeB)
//   })
//
//   return arr
// })

// (Optional) validate a new timezone id before saving it
function isValidTimeZone(tz: string) {
  try { new Intl.DateTimeFormat(undefined, { timeZone: tz }); return true } catch { return false }
}

/* ---------- date-difference helpers (Yesterday/Tomorrow) ---------- */
const dateFmtCache = new Map<string, Intl.DateTimeFormat>()
function dateParts(d: Date, tz: string) {
  const key = `date|${tz}`
  if (!dateFmtCache.has(key)) {
    dateFmtCache.set(
        key,
        new Intl.DateTimeFormat('en-CA', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
    )
  }
  const parts = dateFmtCache.get(key)!.formatToParts(d)
  const y = Number(parts.find(p => p.type === 'year')?.value)
  const m = Number(parts.find(p => p.type === 'month')?.value)
  const day = Number(parts.find(p => p.type === 'day')?.value)
  return { y, m, day }
}

/** Days since epoch in a given TZ (ignores time-of-day) */
function ordinalDay(d: Date, tz: string) {
  const { y, m, day } = dateParts(d, tz)
  return Math.trunc(Date.UTC(y, m - 1, day) / 86_400_000)
}

/** -1 = Yesterday, 0 = Today, +1 = Tomorrow (relative to homeTz) */
function dayDelta(tz: string) {
  const base = ordinalDay(now.value, homeTz.value)
  const theirs = ordinalDay(now.value, tz)
  return Math.max(-1, Math.min(1, theirs - base))
}

function dayBadge(tz: string) {
  const d = dayDelta(tz)
  return d > 0 ? '(+1)' : d < 0 ? '(-1)' : ''
}

watch(() => props.clocks, async (newClocks) => {
  if (!newClocks || newClocks.length === 0) {
    holidayData.value.clear(); // Clear data if there are no clocks
    return;
  }

  isLoadingHolidays.value = true;

  // Create an array of promises to fetch all holidays in parallel
  const holidayPromises = newClocks.map(async (clock) => {
    const holidayName = await getHolidayForLocation(clock.id);
    return { id: clock.id, name: holidayName };
  });

  // Wait for all fetches to complete
  const results = await Promise.all(holidayPromises);

  // Update the map with all results at once for better reactivity
  const newHolidayMap = new Map<number, string | null>();
  results.forEach(result => {
    if (result.name) { // Only add to the map if there is a holiday
      newHolidayMap.set(result.id, result.name);
    }
  });
  holidayData.value = newHolidayMap;

  isLoadingHolidays.value = false;

}, { immediate: true, deep: true });

</script>

<template>
  <div v-for="clock in sortedClocks" :key="clock.id"
       class="card-wrapper"
  >
    <div class="glass-card clock-component"
         style="min-width: 100px"
         @dblclick="emit('editClock', clock)">

      <div class="city-header" :title="holidayData.get(clock.id)!">
        <span>{{ clock.label }}</span>
        <PartyHorn v-if="holidayData.get(clock.id)" />
      </div>
      <div class="city-header">
        {{ formatTime(now, clock.tz) }}
        <span v-if="displayAbbr(clock.tz)" class="wc-abbr">{{ displayAbbr(clock.tz) }}</span>
        <!--      <span class="wc-offset">{{ displayOffset(g.sampleTz) }}</span>-->
        <span v-if="dayBadge(clock.tz)" class="wc-dayflag">{{ dayBadge(clock.tz) }}</span>

        <div class="daytime" style="max-width: 1.2rem">
        <span class="daylight-avatar">
          <svg v-if="isDayOrNight(formatTime(now, clock.tz)) === 'day'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px">
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
          <svg v-if="isDayOrNight(formatTime(now, clock.tz)) === 'night'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 15px; height: 15px">
            <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
          </svg>
        </span>
        </div>
      </div>
      <div class="avatar-group">
      <span v-if="props.weatherData.get(clock.label)?.temp" :title="`${props.weatherData.get(clock.label)?.description}`">
        {{ ` ${props.weatherData.get(clock.label)?.temp}° ` }}
      </span>

        <div v-if="props.teamMembers.filter(tm => tm.city === clock.label).length > 0" class="teammembers" style="display: flex; align-items: center; gap: 3px;">
          <div v-for="teamMember in props.teamMembers.filter(tm => tm.city === clock.label)" class="avatar">
            {{teamMember.name}}
          </div>
        </div>

      </div>

    </div>
  </div>

</template>

<style scoped>

.card-wrapper {
  position: relative; /* This is where the icons will be positioned from */
}

.glass-card {
  /* Base styles for the glass-like cards */
  display: flex;
  color: white;
  font-size: small;
  font-weight: 400;
  padding: 0.5rem; /* 8px */
  user-select: none;
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* For Safari */
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);


  overflow: hidden;   /* Crucial: Hides the shine when it's outside the card */
  transition: all 0.2s ease-in-out; /* Smooth transition for scale, etc. */
}

/* --- Shine Effect --- */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -75%; /* Start off-screen to the left */
  width: 50%; /* Width of the shine */
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%, /* The actual shine color/opacity */
      rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg); /* Skew to give it a slanted appearance */
  pointer-events: none;     /* Ensures it doesn't interfere with mouse events */
  opacity: 0;               /* Hidden by default */
  transition: all 0.6s ease; /* Smooth transition for the shine movement */
  z-index: 1;               /* Make sure it's above the card content */
}

.glass-card:hover {
  cursor: pointer;
  transform: translateY(-2px) scale(1.02); /* Slight lift and scale on hover */
  box-shadow: 0 25px 30px -10px rgb(0 0 0 / 0.15), 0 10px 12px -8px rgb(0 0 0 / 0.1);
}

.glass-card:hover::before {
  left: 125%; /* Move across to off-screen right */
  opacity: 1; /* Make it visible during the transition */
}

.card-content {
  position: relative; /* This allows z-index to work */
  z-index: 110;         /* Lifts the content above the shine effect (which is z-index: 1) */

  /* Re-apply flex to match original layout */
  display: flex;
  flex-direction: column;
  width: 100%;
}

.clock-component {
  /* flex flex-col text-center w-fit min-h-[99px] + shared styles */
  flex-direction: column;
  text-align: center;
  width: fit-content;
  min-height: 64px;
  background: rgba(0,0,0,0.28) !important;
  color: white;
  user-select: none;
  z-index: 120;
}

/* Zone abbrev (PDT/CEST) – small & subtle */
.wc-abbr {
  font-size: .72rem;
  font-weight: 650;
  opacity: .7;
  transform: translateY(-1px);
  margin-right: 2px;
}

/* GMT+/- offset – even smaller */
.wc-offset {
  font-size: 0.68rem;
  font-weight: 600;
  opacity: .75;
  transform: translateY(-1px);
  margin-right: 2px;
}

/* New: Yesterday/Tomorrow badge — very subtle */
.wc-dayflag {
  padding: 2px 2px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .2px;
  opacity: .66;
  transform: translateY(-1px);
}

.avatar-group {
  /* flex m-auto space-x-0.5 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  gap: 8px; /* 2px */
  width: 100%;
}

.avatar {
  /* w-8 h-8 border rounded-full flex items-center justify-center text-white text-xs font-medium */
  width: 1.2rem; /* 32px */
  height: 1.2rem; /* 32px */
  background: white;
  border: 2px solid white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: gray;
  font-size: 0.8rem; /* 12px */
  font-weight: bold;
}

.daylight-avatar {
  /* w-8 h-8 border rounded-full flex items-center justify-center text-white text-xs font-medium */
  width: 1.2rem; /* 32px */
  height: 1.2rem; /* 32px */
  background: transparent;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem; /* 12px */
  font-weight: bold;
}

.city-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px; /* Adjust spacing between text and icon */
}

</style>