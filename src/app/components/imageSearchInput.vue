<template>
  <div v-ripple class="q-dialog-image-input">
    <div v-if="store.queryImageInput === null" class="q-dialog-image-input-tip">
      Click here to upload an image from your local device for image search...
    </div>
    <img v-if="store.queryImageInput !== null" :src="store.queryImageInput" class="q-dialog-image-input-image" />
    <ui-icon-button
      v-if="store.queryImageInput !== null"
      class="q-dialog-advance-input-clear-button"
      icon="clear"
      @click="
        () => {
          store.queryImageInput = null;
        }
      "
    >
    </ui-icon-button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { EnvAdapter } from '../adapter/EnvAdapter';
import { searchType } from '../models/searchWindowEnum';
import { ImageSearchQuery } from '../services/search/searchQueryService';
import { performQuerySearchService } from '../services/search/performQuerySearchService';
import { useSearchStore } from '../states/searchWindowState';
import { displayErrorDialog } from '../utils/handleCatchError';

const store = useSearchStore();

const postAppImageSearchResCallBack = async (file_content: Buffer | null) => {
  store.tabActiveItem = searchType.IMAGE;
  await EnvAdapter.adjustVisible(true);
  if (file_content !== null) {
    const blob = new Blob([file_content], { type: 'image/png' });
    store.queryImageInput = URL.createObjectURL(blob);
    const req = new ImageSearchQuery(blob);
    await performQuerySearchService(req, 0);
  } else {
    displayErrorDialog('Error Fetching Local Picture!');
  }
};

onMounted(() => {
  EnvAdapter.triggerImageSearchService().init(postAppImageSearchResCallBack);
  EnvAdapter.log('imageSearchInputComponents mounted');
});
</script>

<style scoped>
.q-dialog-image-input {
  position: relative;
  width: 100%;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: rgba(29, 30, 30, 0.21);
}

.q-dialog-image-input-image {
  max-height: 100%;
  width: auto;
}

.q-dialog-advance-input-clear-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
  font-size: 16px;
  cursor: pointer;
}
</style>
