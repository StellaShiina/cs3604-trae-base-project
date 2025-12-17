<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface SelectOption {
  value: string;
  label: string;
}

const props = defineProps<{
  options: (string | SelectOption)[];
  modelValue: string; // Vue 3 standard for v-model
  placeholder: string;
  disabled?: boolean;
  testId?: string;
  getDisplayValue?: (value: string, label: string) => string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const isExpanded = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Standardize options
const normalizedOptions = computed(() => {
  return props.options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
});

// Get display value for selected item
const displayValue = computed(() => {
  const selected = normalizedOptions.value.find(opt => opt.value === props.modelValue);
  if (!selected) return props.placeholder;
  
  if (props.getDisplayValue) {
    return props.getDisplayValue(selected.value, selected.label);
  }
  return selected.label;
});

const handleToggle = (e: MouseEvent) => {
  if (!props.disabled) {
    e.stopPropagation();
    isExpanded.value = !isExpanded.value;
  }
};

const handleSelect = (optionValue: string) => {
  if (!props.disabled) {
    emit('update:modelValue', optionValue);
    emit('change', optionValue);
    isExpanded.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isExpanded.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isExpanded.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleToggle(e as unknown as MouseEvent);
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div 
    ref="dropdownRef"
    class="select-dropdown"
    :class="{ disabled: disabled, expanded: isExpanded }"
    :data-testid="testId"
    @click="handleToggle"
    @keydown="handleKeyDown"
    :tabindex="disabled ? -1 : 0"
  >
    <div class="selected-value-display">
      {{ displayValue }}
    </div>
    <input
      type="hidden"
      :value="modelValue || placeholder"
      readonly
    />
    <span 
      data-testid="dropdown-arrow"
      class="arrow"
      :class="{ rotated: isExpanded }"
    ></span>
    <div v-if="isExpanded && !disabled && normalizedOptions.length > 0" class="options-list">
      <div
        v-for="(option, index) in normalizedOptions"
        :key="index"
        class="option"
        :class="{ selected: option.value === modelValue }"
        @click.stop="handleSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== SelectDropdown Component Styles ==================== */
.select-dropdown {
  position: relative !important;
  width: 100% !important;
  cursor: pointer !important;
  user-select: none !important;
  z-index: 1 !important; /* Default z-index */
}

/* ==================== Expanded State ==================== */
.select-dropdown.expanded {
  z-index: 10000 !important;
}

/* ==================== Disabled State ==================== */
.select-dropdown.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

/* ==================== Selected Value Display Area ==================== */
.selected-value-display {
  width: 100% !important;
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 28px 0 10px !important;
  border: 1px solid #cccccc !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  background-color: #e9e9ed !important;
  cursor: pointer !important;
  outline: none !important;
  transition: all 0.3s !important;
  user-select: none !important;
  color: #333 !important;
  box-sizing: border-box !important;
  text-align: center !important;
}

.select-dropdown:not(.disabled) .selected-value-display:hover {
  border-color: #3b99fc !important;
}

.select-dropdown.expanded .selected-value-display {
  border-color: #3b99fc !important;
  box-shadow: 0 0 0 2px #f5f5f5 !important;
}

.select-dropdown.disabled .selected-value-display {
  background-color: #f5f5f5 !important;
  cursor: not-allowed !important;
  color: #999999 !important;
}

/* ==================== Dropdown Arrow ==================== */
.arrow {
  position: absolute !important;
  right: 12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  cursor: pointer !important;
  transition: transform 0.3s !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 4px solid transparent !important;
  border-right: 4px solid transparent !important;
  border-top: 5px solid #666 !important;
  pointer-events: none !important;
}

.arrow.rotated {
  transform: translateY(-50%) rotate(180deg) !important;
}

/* ==================== Options List ==================== */
.options-list {
  position: absolute !important;
  top: calc(100% + 4px) !important;
  left: 0 !important;
  right: 0 !important;
  background: white !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  max-height: 300px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important; /* Hide horizontal scrollbar */
  z-index: 9999 !important;  /* Ensure it shows above everything */
  animation: slideDown 0.2s ease-out !important;
}

.option {
  padding: 8px 12px !important;
  font-size: 13px !important;
  color: #333 !important;
  cursor: pointer !important;
  transition: background-color 0.2s !important;
  text-align: left !important;
}

.option:hover {
  background-color: #f5f5f5 !important;
  color: #3b99fc !important;
}

.option.selected {
  background-color: #e6f7ff !important;
  color: #3b99fc !important;
  font-weight: 500 !important;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>