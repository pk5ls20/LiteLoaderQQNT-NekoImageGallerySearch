<template>
  <div v-for="it in store.searchResults" :key="it.img.id" class="q-search-result-item">
    <ui-menu-anchor>
      <img
        :alt="it.img.ocr_text"
        :src="`${store.pluginSettingData.nekoimage_api}${it.img.url}`"
        @click="handleImageClick(it.img.url, it.img.id)"
        @contextmenu.prevent="handleImageRightClick(it.img.id)"
      />
      <ui-menu
        v-model="store.searchResultItemOpenStates[it.img.id]"
        :style="{ transform: 'scale(0.8)' }"
        @selected="performSimilarSearch(it.img.id, fetchType.FIRST)"
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
import { EnvAdapter } from '../Adapter/EnvAdapter';
import { fetchStatus, fetchType } from '../Models/searchWindowEnum';
import { SearchQueryServices, SimilarSearchQuery } from '../Services/search/searchQueryServices';
import { performQuerySearchService } from '../Services/search/performQuerySearchService';
import { useSearchStore } from '../States/searchWindowState';

const store = useSearchStore();

const performLoadMoreSearch = async () => {
  // store.lastQueryEntry must not be null
  await performQuerySearchService(store.lastQueryEntry as SearchQueryServices, fetchType.MORE);
};

const performSimilarSearch = async (searchId: string, type: fetchType) => {
  const query = new SimilarSearchQuery(searchId);
  await performQuerySearchService(query, type);
};

const handleImageClick = async (url: string, id: string) => {
  const msg = { src: `${store.pluginSettingData.nekoimage_api}${url}` }; // TODO: url maybe not always fs, maybe s3 url?
  EnvAdapter.log('Adding editor', msg);
  EnvAdapter.log(`Image ID: ${id}`);
  EnvAdapter.addNTQQEditor(msg);
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
