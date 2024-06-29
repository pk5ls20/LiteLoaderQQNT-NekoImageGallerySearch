<template>
  <div class="icon-progress-button">
    <ui-icon-button :icon="icon" v-bind="$attrs" @click="handleClick" />
    <svg class="progress-ring" height="40" width="40">
      <circle
        :cx="20"
        :cy="20"
        :r="radius"
        :stroke="props.color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        class="progress-ring__circle"
        fill="transparent"
        stroke-width="4"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue';

const props = withDefaults(
  defineProps<{
    icon: string;
    progress?: number;
    color?: string;
  }>(),
  {
    progress: 0,
    color: 'green'
  }
);

const emits = defineEmits(['click']);

const radius = 18;
const circumference = computed(() => 2 * Math.PI * radius);
const strokeDashoffset = computed(() => circumference.value - props.progress * circumference.value);

function handleClick(event: Event) {
  emits('click', event);
}
</script>

<style>
.icon-progress-button {
  display: flex;
  align-items: center;
  position: relative;
}

.progress-ring {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
