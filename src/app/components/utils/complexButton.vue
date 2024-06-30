<template>
  <ui-icon-button
    :class="['ui-dual-icon-button', className]"
    :disabled="disabled"
    @click="handleClick"
    @update:modelValue="handleUpdate"
  >
    <template #default>
      <div :class="{ 'disabled-icon': disabled }" class="icon-container">
        <i :class="['material-icons', iconClass]" v-text="icon"></i>
        <i :class="['material-icons', secondIconClass, 'second-icon']" v-text="secondIcon"></i>
      </div>
    </template>
  </ui-icon-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  icon: String,
  secondIcon: String,
  modelValue: Boolean,
  disabled: Boolean
});

const emit = defineEmits(['click', 'update:modelValue']);

const iconClass = computed(() => 'mdc-icon-button__icon--on');
const secondIconClass = computed(() => 'mdc-icon-button__icon--on second-icon--on');

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const handleUpdate = (value: boolean) => {
  emit('update:modelValue', value);
};

const className = computed(() => ({
  'has-second-icon': !!props.secondIcon
}));
</script>

<style scoped>
.second-icon {
  position: absolute;
  right: 0;
  bottom: 3px;
  transform: scale(0.8);
}

.disabled-icon {
  opacity: 0.4;
  pointer-events: none;
}
</style>
