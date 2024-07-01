<template>
  <ui-chips>
    <ui-chip
      :style="{ color: searchStore.serverStatusColor }"
      class="q-status-bar-state"
      @click="searchStore.isStatusDialogOpen = !searchStore.isStatusDialogOpen"
    >
      <span class="q-status-bar-state-button">●</span>
      <span class="q-status-bar-state-text">{{ searchStore.serverStatusMessage }}</span>
    </ui-chip>
  </ui-chips>
  <icon-progress-button
    :color="uploadStore.progressColor"
    :progress="uploadStore.uploadProgress"
    class="q-status-bar-upload"
    icon="upload"
    @click="changeComponent"
  ></icon-progress-button>
</template>

<script lang="ts" setup>
import IconProgressButton from '../utils/iconProgressButton.vue';
import { useMainStore } from '../../states/mainWindowState';
import { useSearchStore } from '../../states/searchWindowState';
import { useUploadStore } from '../../states/uploadWindowState';
import SearchWindow from '../../views/searchWindow.vue';
import UploadWindow from '../../views/uploadWindow.vue';

const mainStore = useMainStore();
const searchStore = useSearchStore();
const uploadStore = useUploadStore();

const changeComponent = () => {
  mainStore.mainWindowShowMark = true;
  mainStore.mainWindowUseCSSAnimate = false;
  setTimeout(() => {
    const currentComponentName = mainStore.mainWindowActiveComponent?.__name;
    mainStore.mainWindowActiveComponent = currentComponentName === 'searchWindow' ? UploadWindow : SearchWindow;
  }, 400);
  setTimeout(() => {
    mainStore.mainWindowShowMark = false;
  }, 500);
};
</script>

<style>
.q-status-bar-state {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
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
