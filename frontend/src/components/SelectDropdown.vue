<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import './SelectDropdown.css';

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: (string | SelectOption)[];
  value: string;
  placeholder: string;
  disabled?: boolean;
  testId?: string;
  getDisplayValue?: (value: string, label: string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  testId: 'select-dropdown'
});

const emit = defineEmits<{
  (e: 'change', value: string): void;
}>();

const isExpanded = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

// Normalize options
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
});

// Get display value
const getDisplayValue = () => {
  const selected = normalizedOptions.value.find(opt => opt.value === props.value);
  if (!selected) return props.placeholder;
  
  if (props.getDisplayValue) {
    return props.getDisplayValue(selected.value, selected.label);
  }
  return selected.label;
};

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isExpanded.value = false;
  }
};

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isExpanded.value = false;
  }
};

// Watch isExpanded to add/remove event listeners
watch(isExpanded, (newValue) => {
  if (newValue) {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

const handleToggle = (e: MouseEvent) => {
  if (!props.disabled) {
    e.stopPropagation();
    isExpanded.value = !isExpanded.value;
  }
};

const handleSelect = (optionValue: string) => {
  if (!props.disabled) {
    emit('change', optionValue);
    isExpanded.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleToggle(e as unknown as MouseEvent);
  }
};
</script>

<template>
  <div 
    ref="dropdownRef"
    class="select-dropdown"
    :class="{ 'disabled': disabled, 'expanded': isExpanded }"
    :data-testid="testId"
    @click="handleToggle"
    @keydown="handleKeyDown"
    :tabindex="disabled ? -1 : 0"
  >
    <div class="selected-value-display">
      {{ getDisplayValue() }}
    </div>
    <input
      type="hidden"
      :value="value || placeholder"
      readonly
    />
    <span 
      data-testid="dropdown-arrow"
      class="arrow"
      :class="{ 'rotated': isExpanded }"
    ></span>
    <div v-if="isExpanded && !disabled && normalizedOptions.length > 0" class="options-list">
      <div
        v-for="(option, index) in normalizedOptions"
        :key="index"
        class="option"
        :class="{ 'selected': option.value === value }"
        @click.stop="handleSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>
