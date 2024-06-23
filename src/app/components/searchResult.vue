<template>
  <div v-for="it in store.searchResults" :key="it.img.id" class="q-search-result-item">
    <ui-menu-anchor>
      <img
        :alt="it.img.ocr_text"
        :src="getPreviewURL(it.img)"
        @click="handleImageClick(it.img, it.img.id)"
        @contextmenu.prevent="handleImageRightClick(it.img.id)"
      />
      <ui-menu
        v-model="store.searchResultItemOpenStates[it.img.id]"
        :style="{ transform: 'scale(0.8)' }"
        @selected="performSimilarSearch(it.img, fetchType.FIRST)"
      >
        <ui-menuitem>
          <ui-menuitem-icon>
            <ui-icon>search</ui-icon>
          </ui-menuitem-icon>
          <ui-menuitem-text :style="{ transform: 'translateX(-20px)' }"> Similar Search </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem-divider />
        <ui-menuitem disabled>
          <ui-menuitem-text> Score: {{ `${(it.score * 100).toFixed(2).toString()}%` }} </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem disabled>
          <ui-menuitem-text> Size: {{ `${it.img.width} x ${it.img.height}` }} </ui-menuitem-text>
        </ui-menuitem>
      </ui-menu>
    </ui-menu-anchor>
  </div>
  <div class="q-search-load-more-button-container">
    <ui-button
      v-if="store.fetchingStatus === fetchStatus.FIRST_SUCCESS || store.fetchingStatus === fetchStatus.MORE_SUCCESS"
      class="q-search-load-more-button"
      @click="performLoadMoreSearch"
      >LOAD MORE
    </ui-button>
    <ui-spinner v-if="store.fetchingStatus === fetchStatus.MORE_FETCHING" active></ui-spinner>
  </div>
</template>
<script setup lang="ts">
import { EnvAdapter } from '../adapter/EnvAdapter';
import type { Image } from '../models/search/Image';
import { fetchStatus, fetchType } from '../models/search/SearchWindowEnum';
import { SearchQueryService, SimilarSearchQuery } from '../services/search/searchQueryService';
import { performQuerySearchService } from '../services/search/performQuerySearchService';
import { useSearchStore } from '../states/searchWindowState';
import { getPreviewURL } from '../utils/getURL';
import { EditorImageMsg, NTQQEditorImageMsg } from '../services/editor/editorMsgService';

const store = useSearchStore();

const performLoadMoreSearch = async () => {
  // store.lastQueryEntry must not be null
  await performQuerySearchService(store.lastQueryEntry as SearchQueryService, fetchType.MORE);
};

const performSimilarSearch = async (searchImage: Image, type: fetchType) => {
  const query = new SimilarSearchQuery(searchImage);
  await performQuerySearchService(query, type);
};

const handleImageClick = async (img: Image, id: string) => {
  const editorImg = new EditorImageMsg(img, 0); // TODO: let user choose picSubType
  const editorMsg = new NTQQEditorImageMsg(editorImg);
  EnvAdapter.log('Adding editor', JSON.stringify(editorMsg));
  EnvAdapter.log(`Image ID: ${id}`);
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
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-search-result-item img {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
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
