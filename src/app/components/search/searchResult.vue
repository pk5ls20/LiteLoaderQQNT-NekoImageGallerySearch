<template>
  <div
    v-for="it in store.searchResults"
    :key="it.img.id"
    class="q-search-result-item"
    @contextmenu.prevent="handleImageRightClick(it.img.id)"
  >
    <ui-menu-anchor>
      <div class="q-search-result-item-image-container">
        <progressive-image
          v-if="!store.searchResultPicLoadFailedMap.get(it.img.id)"
          :alt="it.img.ocr_text"
          :src="getPreviewURL(it.img)"
          @click="handleImageClick(it.img, it.img.id)"
          @error="store.searchResultPicLoadFailedMap.set(it.img.id, true)"
        />
        <div v-else class="material-icons placeholder">broken_image</div>
      </div>
      <ui-menu v-model="store.searchResultItemOpenStates[it.img.id]" :style="{ transform: 'scale(0.8)' }">
        <ui-menuitem @click="performSimilarSearch(it.img, fetchType.FIRST)">
          <ui-menuitem-icon>
            <ui-icon>search</ui-icon>
          </ui-menuitem-icon>
          <ui-menuitem-text :style="{ transform: 'translateX(-20px)' }">
            {{ $t('search.searchResult.similarSearchLabel') }}
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem-divider />
        <ui-menuitem disabled>
          <ui-menuitem-text>
            {{ $t('search.searchResult.scoreLabel', [(it.score * 100).toFixed(2).toString()]) }}
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem disabled>
          <ui-menuitem-text>
            {{ $t('search.searchResult.sizeLabel', [it.img.width, it.img.height]) }}
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem-divider v-if="store.serverAdminAvailable" />
        <ui-menuitem v-if="store.serverAdminAvailable" @click="handleLikeClick(it.img)">
          <ui-menuitem-icon>
            <ui-icon>{{ it.img.starred ? 'favorite' : 'favorite_border' }}</ui-icon>
          </ui-menuitem-icon>
          <ui-menuitem-text :style="{ transform: 'translateX(-20px)' }">
            {{ it.img.starred ? $t('search.searchResult.dislikeLabel') : $t('search.searchResult.likeLabel') }}
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem v-if="store.serverAdminAvailable" @click="handleDeleteClick(it.img)">
          <ui-menuitem-icon>
            <ui-icon :style="{ color: 'red' }">delete_outline</ui-icon>
          </ui-menuitem-icon>
          <ui-menuitem-text :style="{ transform: 'translateX(-20px)', color: 'red !important' }">
            {{ $t('search.searchResult.deleteLabel') }}
          </ui-menuitem-text>
        </ui-menuitem>
      </ui-menu>
    </ui-menu-anchor>
  </div>
  <div class="q-search-load-more-button-container">
    <ui-button
      v-if="store.fetchingStatus === fetchStatus.FIRST_SUCCESS || store.fetchingStatus === fetchStatus.MORE_SUCCESS"
      class="q-search-load-more-button"
      @click="performLoadMoreSearch"
    >
      {{ $t('search.searchResult.loadMoreLabel') }}
    </ui-button>
    <ui-spinner v-if="store.fetchingStatus === fetchStatus.MORE_FETCHING" active></ui-spinner>
  </div>
  <ui-dialog v-model="store.confirmDeleteDialogOpen" class="q-fetch-common-dialog" @confirm="handleConfirmDelete">
    <ui-dialog-title> {{ $t('search.searchResult.deleteConfirmTitle') }}</ui-dialog-title>
    <ui-dialog-content> {{ $t('search.searchResult.deleteConfirmContent') }}</ui-dialog-content>
    <ui-dialog-actions></ui-dialog-actions>
  </ui-dialog>
</template>

<script setup lang="ts">
import { EnvAdapter } from '../../adapter/EnvAdapter';
import type { Image } from '../../models/search/Image';
import { fetchStatus, fetchType } from '../../models/search/SearchWindowEnum';
import { performLoadMoreSearch, performSimilarSearch } from '../../services/search/performSearchQueryService';
import { useSearchStore } from '../../states/searchWindowState';
import { getPreviewURL, getUrlBase64 } from '../../utils/getURL';
import { EditorImageMsg, NTQQEditorImageMsg } from '../../services/editor/editorMsgService';
import { deleteImage, updateOpt } from '../../services/search/AdminApi';
import { useI18n } from 'vue-i18n';
import progressiveImage from '../utils/progressiveImage.vue';

const store = useSearchStore();
const { t } = useI18n();

const handleLikeClick = async (img: Image) => {
  try {
    await updateOpt(img.id, !img.starred);
    store.snackbarContent = img.starred
      ? t('search.searchResult.dislikeSuccessText', [img.id])
      : t('search.searchResult.likeSuccessText', [img.id]);
    img.starred = !img.starred;
  } catch (e) {
    store.snackbarContent = t('search.searchResult.likeErrorText');
  }
  store.snackbarOpen = true;
};

const handleDeleteClick = async (img: Image) => {
  store.confirmDeleteImage = img;
  store.confirmDeleteDialogOpen = true;
};

const handleConfirmDelete = async (confirmed: boolean) => {
  if (!confirmed) {
    store.snackbarContent = t('search.searchResult.deleteCancelText');
    store.snackbarOpen = true;
    return;
  }
  try {
    await deleteImage(store.confirmDeleteImage?.id as string);
    store.snackbarContent = t('search.searchResult.deleteSuccessText');
  } catch (e) {
    store.snackbarContent = t('search.searchResult.deleteErrorText');
  }
  store.snackbarOpen = true;
};

const handleImageClick = async (img: Image, id: string) => {
  img.url = await getUrlBase64(img.url);
  const editorImg = new EditorImageMsg(img, store.pluginSettingData.nekoimage_pic_subtype);
  const editorMsg = new NTQQEditorImageMsg(editorImg);
  // EnvAdapter.log('Adding editor', JSON.stringify(editorMsg));
  // EnvAdapter.log(`Image ID: ${id}`);
  EnvAdapter.addNTQQEditor([editorMsg]);
  await EnvAdapter.adjustVisible(false);
};

const handleImageRightClick = (id: string) => {
  // clear before right-click state, ensure the context menu only appears once at a time
  Object.keys(store.searchResultItemOpenStates).forEach((key) => {
    store.searchResultItemOpenStates[key] = false;
  });
  store.searchResultItemOpenStates[id] = !store.searchResultItemOpenStates[id];
};
</script>

<style scoped>
.q-search-result-item {
  height: 100px;
  width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-search-result-item img {
  height: 100px;
  width: 100px;
  object-fit: contain;
}

.q-search-load-more-button-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
}

.q-search-load-more-button {
  width: auto;
}
</style>
