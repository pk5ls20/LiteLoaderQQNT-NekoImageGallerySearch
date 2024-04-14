<template>
  <ui-textfield v-model="store.queryBasicInput"
                :dense="false"
                class="q-dialog-search-input"
                outlined
                @keyup.enter="performBasicSearch(fetchType.FIRST)">
    Search...
  </ui-textfield>
  <ui-button
      class="q-dialog-search-button"
      raised @click="performBasicSearch(fetchType.FIRST)">
    GO🔍
  </ui-button>
  <ui-icon-button icon="casino" @click="performRandomSearch"></ui-icon-button>
</template>

<script setup lang="ts">
import {SearchBasis} from "../Models/SearchBasis";
import {fetchType, searchType} from "../Models/searchWindowEnum";
import {performQuerySearchService} from "../Services/search/performQuerySearchService";
import {RandomSearchQuery, TextSearchQuery} from "../Services/search/searchQueryServices";
import {useSearchStore} from "../States/searchWindowState";

const store = useSearchStore()

const performBasicSearch = async (type: fetchType) => {
  const query = new TextSearchQuery(
      store.queryBasicInput,
      store.tabActiveItem === searchType.TEXT ? SearchBasis.vision : SearchBasis.ocr,
      false
  );
  await performQuerySearchService(query, type);
};

const performRandomSearch = async () => {
  await performQuerySearchService(new RandomSearchQuery(), fetchType.FIRST)
}

</script>

<style scoped>
.q-dialog-search-input {
  padding: 8px;
  width: calc(90% - 16px);
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