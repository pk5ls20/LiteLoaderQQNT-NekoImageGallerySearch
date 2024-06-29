<template>
  <div v-ripple class="q-dialog-image-input" @click="handleUploadImageQuery">
    <div v-if="store.queryImageInput === null" class="q-dialog-image-input-tip">
      Click here to upload an image from your local device for image search...
    </div>
    <img v-if="store.queryImageInput !== null" :src="store.queryImageInput" class="q-dialog-image-input-image" />
    <ui-icon-button
      v-if="store.queryImageInput !== null"
      class="q-dialog-advance-input-clear-button"
      icon="clear"
      @click.stop="
        () => {
          store.queryImageInput = null;
        }
      "
    >
    </ui-icon-button>
    <ui-icon-button
      :icon="store.isEnableFilterOptions ? 'filter_alt' : 'filter_alt_off'"
      :style="{ right: store.queryImageInput === null ? '0px' : '50px' }"
      class="q-dialog-advance-input-filter-button"
      @click.stop="store.isFilterOptionsDialogOpen = true"
    ></ui-icon-button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { EnvAdapter } from '../../adapter/EnvAdapter';
import { searchType } from '../../models/search/SearchWindowEnum';
import { ImageSearchQuery } from '../../services/search/searchQueryService';
import { performQuerySearchService } from '../../services/search/performQuerySearchService';
import { useSearchStore } from '../../states/searchWindowState';
import { displayErrorDialog } from '../../utils/handleCatchError';

const store = useSearchStore();

const handleUploadImageQuery = async () => {
  const imgList = await EnvAdapter.UploadAddFileService().selectFiles(false);
  // because it is not available to choose more, in theory, the IMG array should have only one element
  // but just check it =w=
  if (imgList.length > 1) {
    displayErrorDialog('Please select only one image!');
    return;
  }
  store.queryImageInput = URL.createObjectURL(imgList[0]);
  const req = new ImageSearchQuery(imgList[0]);
  await performQuerySearchService(req, 0);
};

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
  font-size: 24px;
  cursor: pointer;
}

.q-dialog-advance-input-filter-button {
  position: absolute;
  top: 0;
  padding: 5px;
  font-size: 24px;
  cursor: pointer;
}
</style>
