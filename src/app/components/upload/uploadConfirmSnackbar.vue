<template>
  <ui-snackbar v-model="uploadStore.uploadSnackbarOpen">
    {{ uploadStore.uploadSnackbarContent }}
  </ui-snackbar>
</template>

<script lang="ts" setup>
import { useUploadStore } from '../../states/uploadWindowState';
const uploadStore = useUploadStore();
</script>
