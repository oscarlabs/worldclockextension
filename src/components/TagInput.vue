<template>
  <div
      class="tag-input-container"
      @click="focusInput"
  >
            <span v-if="groupTeamMembers.length > 0"
                v-for="(teamMember, index) in groupTeamMembers"
                :key="teamMember + index"
                class="member-pill"
            >
              {{ teamMember }}
              <span
                  class="remove-btn"
                  @click.stop="removeTag(teamMember)"
              >
                &times;
              </span>
            </span>

    <input
        ref="inputRef"
        type="text"
        placeholder="Add Team member (e.g OP)"
        maxlength="2"
        v-model="newTeamMember"
        @keydown.enter.prevent="addTeamMember"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';

// --- Reactive State ---

const props = defineProps(['teamMembers', 'selectedTimezone']);
const emit = defineEmits(['addTeamMember', 'removeTeamMember']);

const groupTeamMembers = ref([])
const newTeamMember: Ref<string | null> = ref(null);

// Holds the list of tags. Initialize with some default values.
const tags = ref(['JD', 'OP']);
// A template ref to get direct access to the input DOM element.
const inputRef = ref(null);


// --- Methods ---

// Adds the current value of 'newTag' to the 'tags' array.
const addTeamMember = () => {
  const tagValue = newTeamMember.value.trim().toUpperCase();
  if (tagValue) {
    // console.log(groupTeamMembers.value);
    groupTeamMembers.value.push(tagValue);
    // console.log(groupTeamMembers.value);
    emit('addTeamMember', tagValue)
  }
  // Clear the input field after adding.
  newTeamMember.value = '';
};

// Removes a tag from the array by its index.
const removeTag = (teamMemberRemoved: string) => {
  groupTeamMembers.value = groupTeamMembers.value.filter(teamMember => teamMember !== teamMemberRemoved)
  emit('removeTeamMember', teamMemberRemoved);
  focusInput()
};

// Focuses the input element when the container is clicked.
const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

onMounted(() => {
  groupTeamMembers.value = [...props.teamMembers.map(teamMember => teamMember.name )]
  focusInput()
})
</script>

<style scoped>
.tag-input-container {
  display: flex;
  flex-wrap: wrap; /* Allows pills to wrap to the next line if needed */
  align-items: center;
  gap: 8px; /* Space between pills */
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2); /* Your glassmorphism style */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: text;
  width: 100%;
}

.member-pill {
  /* Style it like your avatars */
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 16px; /* Make it a pill/circle */
  font-size: 14px;
}

/* The remove button ('x') */
.member-pill .remove-btn {
  opacity: 0.7; /* Hidden by default */
  margin-left: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
}

/* THE MAGIC: Show the 'x' on hover */
.member-pill:hover .remove-btn {
  opacity: 1;
}

/* The actual input field should be seamless */
.tag-input-container input {
  border: none;
  background: transparent;
  outline: none;
  color: white;
  flex-grow: 1; /* Allows it to take up remaining space */
}

.tag-input-container input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
</style>