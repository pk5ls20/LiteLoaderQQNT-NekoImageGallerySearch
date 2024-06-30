<template>
  <ui-dialog v-model="store.isStatusDialogOpen" class="q-status-dialog">
    <ui-dialog-title>
      {{ $t('search.searchWindowDialog.statusDialogTitle') }}
    </ui-dialog-title>
    <ui-dialog-content v-if="store.pluginSettingData">
      {{ store.serverStatusMsg }}
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="store.isStatusDialogOpen = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
  <ui-dialog v-model="store.isFetchError" class="q-status-dialog">
    <ui-dialog-title> 🤯{{ $t('search.searchWindowDialog.fetchErrorDialogTitle') }}</ui-dialog-title>
    <ui-dialog-content>
      {{ store.fetchErrorMsg }}
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="store.isFetchError = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useSearchStore } from '../../states/searchWindowState';
import { useI18n } from 'vue-i18n';
const store = useSearchStore();
const { t } = useI18n();

onMounted(() => {
  store.serverStatusMsg = store.serverStatusMsg
    ? store.serverStatusMsg
    : t('search.searchWindowDialog.serverStatusMsg');
  store.serverStatusMessage = store.serverStatusMessage
    ? store.serverStatusMessage
    : t('search.searchWindowDialog.serverStatusMessage');
});
</script>
