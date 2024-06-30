<template>
  <ui-dialog v-model="store.isStatusDialogOpen" class="q-status-dialog">
    <ui-dialog-title>
      {{ $t('search.searchWindowDialog.statusDialogTitle') }}
    </ui-dialog-title>
    <ui-dialog-content v-if="store.pluginSettingData" class="q-status-dialog-content">
      <div>
        {{
          $t('search.searchWindowDialog.ocrAvailableText', [
            $t(`search.searchWindowDialog.ocrAvailableMessage[${store.serverOCRAvailable ? 0 : 1}]`)
          ])
        }}
      </div>
      <div>
        {{
          $t('search.searchWindowDialog.authStatusText', [
            $t(`search.searchWindowDialog.authStatusMessage[${store.serverAuthorizationRenderItem}]`)
          ])
        }}
      </div>
      <div>
        {{
          $t('search.searchWindowDialog.adminAPIStatusText', [
            $t(`search.searchWindowDialog.adminAPIStatusMessage[${store.serverAdminAPIRenderItem}]`)
          ])
        }}
      </div>
      <ui-collapse ripple with-icon>
        <template #toggle>
          <div>{{ $t('search.searchWindowDialog.rawOutputLabel') }}</div>
        </template>
        <div>{{ store.serverStatusMsg }}</div>
      </ui-collapse>
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="store.isStatusDialogOpen = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
  <ui-dialog v-model="store.isFetchError" class="q-fetch-error-dialog">
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

<style scoped>
.q-status-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 500px;
  line-height: 1.6;
}
</style>
