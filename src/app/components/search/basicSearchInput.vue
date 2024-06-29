<template>
  <ui-textfield
    v-model="store.queryBasicInput"
    :dense="false"
    class="q-dialog-search-input"
    outlined
    @keyup.enter="performBasicSearch(fetchType.FIRST)"
  >
    Search...
    <template #after>
      <ui-textfield-icon @click="store.isFilterOptionsDialogOpen = true">
        {{ store.isEnableFilterOptions ? 'filter_alt' : 'filter_alt_off' }}
      </ui-textfield-icon>
    </template>
  </ui-textfield>
  <ui-button class="q-dialog-search-button" raised @click="performBasicSearch(fetchType.FIRST)"> GO🔍 </ui-button>
  <ui-icon-button icon="casino" @click="performRandomSearch"></ui-icon-button>
</template>

<script setup lang="ts">
import { SearchBasis } from '../../models/search/SearchBasis';
import { fetchType, searchType } from '../../models/search/SearchWindowEnum';
import { performQuerySearchService } from '../../services/search/performQuerySearchService';
import { RandomSearchQuery, TextSearchQuery } from '../../services/search/searchQueryService';
import { useSearchStore } from '../../states/searchWindowState';

const store = useSearchStore();

const performBasicSearch = async (type: fetchType) => {
  const query = new TextSearchQuery(
    store.queryBasicInput,
    store.tabActiveItem === searchType.TEXT ? SearchBasis.vision : SearchBasis.ocr,
    false
  );
  await performQuerySearchService(query, type);
};

const performRandomSearch = async () => {
  await performQuerySearchService(new RandomSearchQuery(), fetchType.FIRST);
};
</script>

<style scoped>
.q-dialog-search-input {
  padding: 8px;
  width: calc(180% - 16px);
  margin-right: 1em;
}

.q-dialog-search-button {
  padding: 8px;
  height: 55px;
  width: calc(40% - 10px);
  cursor: pointer;
  margin-right: 1em;
}
</style>
