<template>
  <ui-dialog v-model="store.isStatusDialogOpen" class="q-status-dialog" fullscreen>
    <ui-dialog-title> Server Status </ui-dialog-title>
    <ui-dialog-content v-if="store.pluginSettingData">
      {{ store.serverStatusMsg }}
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="store.isStatusDialogOpen = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
  <ui-dialog v-model="store.isFetchError" class="q-status-dialog" fullscreen>
    <ui-dialog-title> 🤯Failed to fetch </ui-dialog-title>
    <ui-dialog-content>
      {{ store.fetchErrorMsg }}
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="store.isFetchError = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
</template>

<script setup lang="ts">
import { useSearchStore } from '../States/searchWindowState';

const store = useSearchStore();
</script>
