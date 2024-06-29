<template>
  <ui-snackbar v-model="uploadStore.uploadEndDialogOpen">
    {{
      $t('upload.uploadConfirmSnackbar.snackbarContent', [
        uploadStore.finishedTasksCount,
        uploadStore.duplicateTasksCount,
        uploadStore.errorTasksCount
      ])
    }}
  </ui-snackbar>
</template>

<script lang="ts" setup>
import { useUploadStore } from '../../states/uploadWindowState';

const uploadStore = useUploadStore();
</script>
