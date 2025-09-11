<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const homeTz = ref(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima'
)

// --- USER CONFIG: use IANA IDs (DST handled automatically) ---
type ClockCfg = { label: string; tz: string }

const clocks = ref<ClockCfg[]>([
  // Your home
  { label: 'Lima', tz: 'America/Lima' },
  // South America
  { label: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
  { label: 'Brasília',     tz: 'America/Sao_Paulo' },

  // USA — Eastern
  { label: 'New York', tz: 'America/New_York' },
  { label: 'Boston',   tz: 'America/New_York' },
  { label: 'Miami',    tz: 'America/New_York' },
  { label: 'Atlanta',  tz: 'America/New_York' },

  // USA — Central
  { label: 'Chicago',  tz: 'America/Chicago' },
  { label: 'Dallas',   tz: 'America/Chicago' },
  { label: 'Houston',  tz: 'America/Chicago' },

  // USA — Mountain
  { label: 'Denver',   tz: 'America/Denver' },

  // USA — Pacific
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'San Francisco', tz: 'America/Los_Angeles' },
  { label: 'Seattle',    tz: 'America/Los_Angeles' },

  // Europe (WET/UTC±1 and CET/CEST)
  { label: 'London',  tz: 'Europe/London' },
  // { label: 'Dublin',  tz: 'Europe/Dublin' },
  // { label: 'Lisbon',  tz: 'Europe/Lisbon' },
  { label: 'Paris',   tz: 'Europe/Paris' },
  { label: 'Berlin',  tz: 'Europe/Berlin' },
  { label: 'Madrid',  tz: 'Europe/Madrid' },

  // Ukraine (single national zone; uses DST EET/EEST)
  { label: 'Kyiv',  tz: 'Europe/Kyiv' },

  // Australia & New Zealand (note DST differences + half-hour)
  { label: 'Sydney',    tz: 'Australia/Sydney' },
  // { label: 'Melbourne', tz: 'Australia/Melbourne' },
  // { label: 'Brisbane',  tz: 'Australia/Brisbane' }, // no DST
  // { label: 'Adelaide',  tz: 'Australia/Adelaide' }, // +0:30 offset vs Sydney/Melb
  // { label: 'Perth',     tz: 'Australia/Perth' },
  // { label: 'Auckland',  tz: 'Pacific/Auckland' },
  // { label: 'Wellington',tz: 'Pacific/Auckland' },
  { label: 'Queenstown', tz: 'Pacific/Auckland' },
  // { label: 'Chatham Is.', tz: 'Pacific/Chatham' }   // +0:45 quirk
])

// Group strategy: 'zone' (recommended) or 'offset'
const groupBy = ref<'zone' | 'offset'>('zone')

// Tick every 30s so minutes stay fresh
const now = ref(new Date())
let handle: number | undefined

onMounted(() => {
  handle = window.setInterval(() => { now.value = new Date() }, 30_000)
})
onUnmounted(() => { if (handle) clearInterval(handle) })

// Intl helpers (cache formatters per tz)
const locale = navigator.language || 'en-US'
const timeFmtCache = new Map<string, Intl.DateTimeFormat>()
function fmtFor(tz: string) {
  const k = `${locale}|${tz}|12h`
  if (!timeFmtCache.has(k)) {
    timeFmtCache.set(k, new Intl.DateTimeFormat(locale, {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz
    }))
  }
  return timeFmtCache.get(k)!
}
function formatTime(d: Date, tz: string) {
  return fmtFor(tz).format(d)
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

function displayOffset(tz: string) {
  return normalizeOffset(tzPart(tz, 'shortOffset'))
}

function zoneName(tz: string, mode: 'short' | 'shortOffset' = 'short') {
  const parts = tzNameFmtFor(tz, mode).formatToParts(now.value)
  return parts.find(p => p.type === 'timeZoneName')?.value ?? ''
}

// Key used for grouping
function zoneKey(tz: string) {
  if (groupBy.value === 'zone') return tz // stable across seasons
  // Offset grouping: changes with DST; good if you want cards to merge
  return zoneName(tz, 'shortOffset') // e.g. "GMT-05:00"
}

// Merge cities that share the same key (zone or current offset)
type Group = { key: string; labels: string[]; sampleTz: string }
const groups = computed<Group[]>(() => {
  const map = new Map<string, Group>()
  for (const c of clocks.value) {
    const key = zoneKey(c.tz)
    const g = map.get(key) || { key, labels: [], sampleTz: c.tz }
    g.labels.push(c.label)
    map.set(key, g)
  }
  // Optional: sort by current time
  const arr = Array.from(map.values())
  const sortByTime = (g: Group) =>
      parseInt(fmtFor(g.sampleTz).formatToParts(now.value).find(p => p.type === 'hour')?.value || '0', 10)
  return arr.sort((a, b) => sortByTime(a) - sortByTime(b))
})

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
</script>

<template>
  <div v-for="g in groups" :key="g.key" class="glass-card clock-component">
    <div>{{ g.labels.join(', ') }}</div>
    <div>
      {{ formatTime(now, g.sampleTz) }}
      <span v-if="displayAbbr(g.sampleTz)" class="wc-abbr">{{ displayAbbr(g.sampleTz) }}</span>
      <span class="wc-offset">{{ displayOffset(g.sampleTz) }}</span>
      <span v-if="dayBadge(g.sampleTz)" class="wc-dayflag">{{ dayBadge(g.sampleTz) }}</span>
    </div>
    <div class="avatar-group">
      <div class="avatar">JD</div>
      <div class="avatar">OP</div>
  </div>

  </div>

</template>

<style scoped>

.glass-card {
  /* Base styles for the glass-like cards */
  display: flex;
  color: white;
  font-weight: 500;
  padding: 0.5rem; /* 8px */
  user-select: none;
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* For Safari */
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-card:hover {
  cursor: pointer;
}

.clock-component {
  /* flex flex-col text-center w-fit min-h-[99px] + shared styles */
  flex-direction: column;
  text-align: center;
  width: fit-content;
  min-height: 69px;
  background: rgba(0,0,0,0.28) !important;
  color: white;
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
  padding: 2px 6px;
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
  margin: auto;
  gap: 0.125rem; /* 2px */
}

.avatar {
  /* w-8 h-8 border rounded-full flex items-center justify-center text-white text-xs font-medium */
  width: 1.3rem; /* 32px */
  height: 1.3rem; /* 32px */
  background: white;
  border: 2px solid white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: gray;
  font-size: 0.65rem; /* 12px */
  font-weight: 500;
}
</style>