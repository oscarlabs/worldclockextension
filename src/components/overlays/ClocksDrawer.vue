<template>
  <div class="clock-manager">
    <CustomTimezoneAutocomplete @timezone-selected="handleAddClock" />

    <div class="clock-list">
      <div
          v-for="clock in clocks"
          :key="clock.id"
          class="clock-item"
          @mouseenter="hoveredClockId = clock.id"
          @mouseleave="hoveredClockId = null"
      >
        <div class="clock-info">
          <span>{{ clock.label }}</span>
          <div class="actions" v-show="hoveredClockId === clock.id || confirmingDeleteId === clock.id">
            <button @click="toggleEdit(clock.id)">{{ editingClockId === clock.id ? 'Done' : 'Edit' }}</button>

            <button v-if="confirmingDeleteId !== clock.id" @click="startDelete(clock.id)" class="delete-btn">Delete</button>
            <button v-else @click="confirmDelete(clock.id)" class="confirm-delete-btn">Confirm?</button>
          </div>
        </div>

        <div v-if="editingClockId === clock.id" class="edit-section">
          <TagInput
              :teamMembers="getTeamMembersForClock(clock.label)"
              @addTeamMember="(name) => handleAddTeamMember(name, clock.label)"
              @removeTeamMember="(name) => handleRemoveTeamMember(name)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TimezoneOption, TeamMember } from '@/App.vue'; // Assuming types are exported from App
import CustomTimezoneAutocomplete from '@/components/CustomTimezoneAutocomplete.vue';
import TagInput from '@/components/TagInput.vue';

const props = defineProps<{
  clocks: TimezoneOption[];
  teamMembers: TeamMember[];
}>();

const emit = defineEmits(['update:clocks', 'update:teamMembers']);

const hoveredClockId = ref<number | null>(null);
const editingClockId = ref<number | null>(null);
const confirmingDeleteId = ref<number | null>(null);
let deleteTimeout: number;

// --- Add Logic ---
const handleAddClock = (clock: TimezoneOption) => {
  if (!props.clocks.some(c => c.id === clock.id)) {
    const updatedClocks = [...props.clocks, clock];
    emit('update:clocks', updatedClocks);
  }
};

// --- Edit Logic ---
const toggleEdit = (clockId: number) => {
  editingClockId.value = editingClockId.value === clockId ? null : clockId;
};
const getTeamMembersForClock = (label: string) => props.teamMembers.filter(tm => tm.city === label);
const handleAddTeamMember = (name: string, city: string) => {
  const updatedMembers = [...props.teamMembers, { name, city }];
  emit('update:teamMembers', updatedMembers);
};
const handleRemoveTeamMember = (name: string) => {
  const updatedMembers = props.teamMembers.filter(tm => tm.name !== name);
  emit('update:teamMembers', updatedMembers);
};

// --- Delete Logic ---
const startDelete = (clockId: number) => {
  confirmingDeleteId.value = clockId;
  deleteTimeout = setTimeout(() => { confirmingDeleteId.value = null; }, 3000); // Auto-revert after 3s
};
const confirmDelete = (clockId: number) => {
  clearTimeout(deleteTimeout);
  const updatedClocks = props.clocks.filter(c => c.id !== clockId);
  emit('update:clocks', updatedClocks);
  confirmingDeleteId.value = null;
};
</script>

<style scoped>
/* Add styles for your new manager component here */
.clock-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 10px; }
.clock-item { padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }
.clock-info { display: flex; justify-content: space-between; align-items: center; }
.actions button { /* basic button styles */ }
.delete-btn { /* styles */ }
.confirm-delete-btn { background-color: #ef4444; color: white; }
.edit-section { margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1rem; }
</style>