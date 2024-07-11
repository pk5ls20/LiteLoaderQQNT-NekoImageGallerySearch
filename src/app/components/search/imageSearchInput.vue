<template>
  <div v-ripple class="q-dialog-image-input" @click="performImageInputSearch">
    <div v-if="searchStore.queryImageInput === null" class="q-dialog-image-input-tip">
      {{ $t('search.imageSearchInput.inputTip') }}
    </div>
    <img
      v-if="searchStore.queryImageInput !== null"
      :src="searchStore.queryImageInput"
      class="q-dialog-image-input-image"
    />
    <ui-icon-button
      v-if="searchStore.queryImageInput !== null"
      class="q-dialog-advance-input-clear-button"
      icon="clear"
      @click.stop="
        () => {
          searchStore.queryImageInput = null;
        }
      "
    >
    </ui-icon-button>
    <ui-icon-button
      :icon="searchStore.isEnableFilterOptions ? 'filter_alt' : 'filter_alt_off'"
      :style="{ right: searchStore.queryImageInput === null ? '0px' : '50px' }"
      class="q-dialog-advance-input-filter-button"
      @click.stop="searchStore.isFilterOptionsDialogOpen = true"
    ></ui-icon-button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { type MimeType } from 'file-type';
import { EnvAdapter } from '../../adapter/EnvAdapter';
import { sharedAdapter } from '../../adapter/SharedAdapter';
import { searchType } from '../../models/search/SearchWindowEnum';
import { performImageSearch } from '../../services/search/performSearchQueryService';
import { useSearchStore } from '../../states/searchWindowState';
import { displaySearchErrorDialog } from '../../utils/handleCatchError';
import { useMainStore } from '../../states/mainWindowState';
import SearchWindow from '../../views/searchWindow.vue';

const mainStore = useMainStore();
const searchStore = useSearchStore();
const { t } = useI18n();

const performImageInputSearch = async () => {
  const imgList = await EnvAdapter.UploadAddFileService().selectFiles(false);
  // because it is not available to choose more, in theory, the IMG array should have only one element
  // but just check it =w=
  if (imgList.length > 1) {
    displaySearchErrorDialog(t('search.imageSearchInput.uploadImageCountMoreThanOneTip'));
    return;
  }
  await performImageSearch(imgList[0]);
};

const postAppImageSearchResCallBack = async (file_content: Uint8Array | null, file_mine: MimeType) => {
  searchStore.tabActiveItem = searchType.IMAGE;
  mainStore.mainWindowActiveComponent = SearchWindow;
  await EnvAdapter.adjustVisible(true);
  if (file_content !== null) {
    const blob = new Blob([file_content], { type: file_mine });
    await performImageSearch(blob);
  } else {
    displaySearchErrorDialog(t('search.imageSearchInput.uploadImageCountMoreThanOneTip'));
  }
};

onMounted(() => {
  EnvAdapter.triggerImageService().init(
    postAppImageSearchResCallBack,
    sharedAdapter.TriggerImageRegisterName.IMAGE_SEARCH
  );
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
