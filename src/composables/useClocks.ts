// src/composables/useClocks.ts

import { ref, computed, type Ref } from 'vue';
import type { TimezoneOption } from '@/assets/world_timezone';

export type TeamMember = {
    name: string;
    city: string;
}

export function useClocks(
    userClocks: Ref<TimezoneOption[]>,
    teamMembers: Ref<TeamMember[]>
) {
    // --- STATE specific to editing ---
    const selectedTimezone = ref<string | null>(null);
    const selectedLocations = ref<TimezoneOption[]>([]);

    // This is a perfect use case for a `computed` property!
    // It will automatically update whenever teamMembers or selectedLocations change.
    const groupTeamMembers = computed(() => {
        if (selectedLocations.value.length === 0) {
            return [];
        }
        const currentCityLabel = selectedLocations.value[0].label;
        return teamMembers.value.filter(member => member.city === currentCityLabel);
    });

    // --- METHODS ---

    const addClock = (timezone: TimezoneOption) => {
        const alreadyExists = userClocks.value.some(clock => clock.id === timezone.id);
        if (alreadyExists) {
            console.warn(`Timezone "${timezone.label}" already exists`);
            return;
        }
        userClocks.value.push(timezone);
    };

    const deleteClock = (clockToDelete: TimezoneOption) => {
        userClocks.value = userClocks.value.filter(clock => clock.id !== clockToDelete.id);
    };

    // This function sets up the state needed FOR an edit
    const startEditClock = (clockToEdit: TimezoneOption) => {
        selectedTimezone.value = clockToEdit.tz;
        selectedLocations.value = [clockToEdit];
        // groupTeamMembers is now computed, so no need to set it manually!
    };

    const addTeamMember = (teamMemberName: string) => {
        if (selectedLocations.value.length === 0) return;
        const currentCity = selectedLocations.value[0].label;
        teamMembers.value.push({ name: teamMemberName, city: currentCity });
    };

    const removeTeamMember = (teamMemberName: string) => {
        teamMembers.value = teamMembers.value.filter(tm => tm.name !== teamMemberName);
    };

    // You were right to be unsure about this. It seems to delete a clock
    // based on the selectedLocations, which might be better named `deleteSelectedClock`.
    // Let's call it `removeLocationFromClocks` for clarity.
    // const removeLocationFromClocks = (locationId: string) => {
    //     userClocks.value = userClocks.value.filter(clock => clock.id !== locationId);
    // };


    // --- RETURN VALUE ---
    // We expose all the state and methods the component will need.
    return {
        selectedTimezone,
        selectedLocations,
        groupTeamMembers,
        addClock,
        deleteClock,
        startEditClock,
        addTeamMember,
        removeTeamMember,
        // removeLocationFromClocks,
    };
}