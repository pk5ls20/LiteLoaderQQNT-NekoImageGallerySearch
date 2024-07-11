<template>
  <ui-textfield
    v-model="store.queryBasicInput"
    :dense="false"
    :disabled="!isSearchComponentsAvailable"
    class="q-dialog-search-input"
    outlined
    @keyup.enter="performBasicSearch(fetchType.FIRST)"
  >
    {{
      isSearchComponentsAvailable
        ? $t('search.basicSearchInput.inputPlaceholder')
        : $t('search.basicSearchInput.inputPlaceholderDisabled')
    }}
    <template #after>
      <ui-textfield-icon @click="store.isFilterOptionsDialogOpen = true">
        {{ store.isEnableFilterOptions ? 'filter_alt' : 'filter_alt_off' }}
      </ui-textfield-icon>
    </template>
  </ui-textfield>
  <ui-button
    :disabled="!isSearchComponentsAvailable"
    class="q-dialog-search-button"
    raised
    @click="performBasicSearch(fetchType.FIRST)"
  >
    GO🔍
  </ui-button>
  <ui-icon-button icon="casino" @click="performRandomSearch"></ui-icon-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { fetchType, searchType } from '../../models/search/SearchWindowEnum';
import { useSearchStore } from '../../states/searchWindowState';
import { performBasicSearch, performRandomSearch } from '../../services/search/performSearchQueryService';

const store = useSearchStore();
const isSearchComponentsAvailable = computed(() => store.serverOCRAvailable || store.tabActiveItem !== searchType.OCR);
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
