<template>
  <label class="passenger-checkbox" :class="{ checked: selected }">
    <input
      type="checkbox"
      :checked="selected"
      @change="$emit('change', ($event.target as HTMLInputElement).checked)"
      class="passenger-checkbox-input"
    />
    <span class="passenger-checkbox-label">
      {{ passenger.name }}
    </span>
  </label>
</template>

<script setup lang="ts">
import './PassengerCheckbox.css';

const props = defineProps<{
  passenger: any;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', checked: boolean): void;
}>();
</script>


