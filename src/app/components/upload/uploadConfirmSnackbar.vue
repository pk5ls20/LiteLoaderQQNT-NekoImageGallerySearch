<template>
  <ui-snackbar v-model="uploadStore.uploadEndDialogOpen">
    {{
      `Upload completed! finish ${uploadStore.finishedTasksCount} tasks,
        which ${uploadStore.duplicateTasksCount} duplicate
        and ${uploadStore.errorTasksCount} errors!`
    }}
  </ui-snackbar>
</template>

<script lang="ts" setup>
import { useUploadStore } from '../../states/uploadWindowState';

const uploadStore = useUploadStore();
</script>
