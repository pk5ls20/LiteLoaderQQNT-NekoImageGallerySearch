<template>
  <ui-chips>
    <ui-chip
      :style="{ color: store.serverStatusColor }"
      class="q-status-bar-state"
      @click="store.isStatusDialogOpen = !store.isStatusDialogOpen"
    >
      <span class="q-status-bar-state-button">●</span>
      <span class="q-status-bar-state-text">{{ store.serverStatusMessage }}</span>
    </ui-chip>
  </ui-chips>
</template>

<script setup lang="ts">
import { useSearchStore } from '../States/searchWindowState';

const store = useSearchStore();
</script>

<style scoped>
.q-status-bar-state {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
}

.q-status-bar-state-button {
  font-size: 28px;
  margin: 0 1px;
  position: relative;
  top: 1px;
}

.q-status-bar-state-text {
  font-size: 14px;
  margin: 0 1px;
  position: relative;
  top: -2px;
}
</style>
