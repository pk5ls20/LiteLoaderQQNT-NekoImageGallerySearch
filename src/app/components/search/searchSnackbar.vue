<template>
  <ui-snackbar v-model="searchStore.snackbarOpen">
    {{ searchStore.snackbarContent }}
  </ui-snackbar>
</template>

<script lang="ts" setup>
import { useSearchStore } from '../../states/searchWindowState';

const searchStore = useSearchStore();
</script>
