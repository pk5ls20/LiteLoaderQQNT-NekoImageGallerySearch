<template>
  <div
      v-for="it in store.searchResults"
      :key="it.img.id"
      class="q-search-result-item"
  >
    <ui-menu-anchor>
      <img
          :alt="it.img.ocr_text"
          :src="`${store.pluginSettingData.nekoimage_api}${it.img.url}`"
          @click="handleImageClick(it.img.url, it.img.id)"
          @contextmenu.prevent="handleImageRightClick(it.img.id)"
      >
      <ui-menu
          v-model="store.searchResultItemOpenStates[it.img.id]"
          :style="{ transform: 'scale(0.8)' }"
          @selected="performSimilarSearch(it.img.id, fetchType.FIRST)"
      >
        <ui-menuitem>
          <ui-menuitem-icon>
            <ui-icon>search</ui-icon>
          </ui-menuitem-icon>
          <ui-menuitem-text :style="{transform: 'translateX(-20px)'}">
            Similar Search
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem-divider/>
        <ui-menuitem disabled>
          <ui-menuitem-text>
            Score: {{ `${(it.score * 100).toFixed(2).toString()}%` }}
          </ui-menuitem-text>
        </ui-menuitem>
        <ui-menuitem disabled>
          <ui-menuitem-text>
            Size: {{ `${it.img.width} x ${it.img.height}` }}
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
    >LOAD MORE
    </ui-button>
    <ui-spinner v-if="store.fetchingStatus === fetchStatus.MORE_FETCHING" active></ui-spinner>
  </div>
</template>
<script setup lang="ts">
import {log} from "../../logs";
import {fetchStatus, fetchType} from "../Models/searchWindowEnum";
import {SimilarSearchQuery} from "../Services/searchQuery";
import {performQuerySearch} from "../Services/performQuerySearch";
import {useSearchStore} from "../States/searchWindowState";
import {isDevEnv} from "../Utils/envFlag";
import {addNTQQEditor} from "../Utils/addNTQQEditor";
import {adjustVisible, windowVisibleState} from "../Utils/windowLoader";

const store = useSearchStore()

const performLoadMoreSearch = async () => {
  await performQuerySearch(store.lastQueryEntry, fetchType.MORE)
}

const performSimilarSearch = async (searchId: string, type: fetchType) => {
  const query = new SimilarSearchQuery(
      searchId
  )
  await performQuerySearch(query, type)
}

const handleImageClick = (url: string, id: string) => {
  log(`Image Clicked: ${url}`);
  log(`Image ID: ${id}`);
  const msg = {src: `${store.pluginSettingData.nekoimage_api}${url}`} // TODO: url maybe not always fs, maybe s3 url?
  if (isDevEnv) {
    log('Dev Env: Adding editor', msg)
  } else {
    addNTQQEditor(msg);
    windowVisibleState.value = false;
    adjustVisible(false);
  }
};

const handleImageRightClick = (id: string) => {
  // clear before right-click state, ensure the context menu only appears once at a time
  Object.keys(store.searchResultItemOpenStates).forEach(key => {
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