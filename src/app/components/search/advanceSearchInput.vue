<template>
  <div class="q-dialog-advance-set">
    <div class="q-dialog-advance-set-tip">
      {{ $t('search.advanceSearchInput.promptTitle') }}
    </div>
    <div class="q-dialog-advance-set-select">
      <ui-chips
        v-model="store.queryAdvanceChipsSelectVal"
        :options="queryAdvanceChipsList"
        class="q-dialog-advance-set-select-chips"
        type="choice"
      ></ui-chips>
      <ui-select
        v-model="store.queryAdvanceModeBind"
        :options="queryAdvanceModes"
        class="q-dialog-advance-set-select-mode"
        outlined
        @click.stop="handleClickStop"
      >
        {{ $t('search.advanceSearchInput.modeSelectLabel') }}
      </ui-select>
    </div>
  </div>
  <div :class="{ active: store.isQueryAdvanceModeClicked }" class="q-dialog-advance-input">
    <ui-textfield
      v-model="store.queryAdvanceInput"
      :change="store.queryAdvanceInputPromptMap.set(store.queryAdvanceChipsSelectVal, store.queryAdvanceInput)"
      :dense="false"
      :disabled="store.queryAdvanceChipsSelectVal === ''"
      :label="
        store.queryAdvanceChipsSelectVal === ''
          ? $t('search.advanceSearchInput.promptInputNoSelectedLabel')
          : $t('search.advanceSearchInput.promptInputSelectedLabel', [
              promptTypeDisplayTextMap.get(store.queryAdvanceChipsSelectVal as promptType) ?? ''
            ])
      "
      class="q-dialog-advance-input-text"
      outlined
      @keyup.enter="
        performAdvanceSearch(
          fetchType.FIRST,
          queryAdvanceLookUp?.[0] as AdvancedSearchMode,
          queryAdvanceLookUp?.[1] as SearchBasis
        )
      "
    >
      <template #after>
        <ui-textfield-icon @click="store.isFilterOptionsDialogOpen = true">
          {{ store.isEnableFilterOptions ? 'filter_alt' : 'filter_alt_off' }}
        </ui-textfield-icon>
      </template>
    </ui-textfield>
    <ui-button
      :class="{ active: store.isQueryAdvanceModeClicked }"
      class="q-dialog-advance-input-search-button"
      raised
      @click="
        performAdvanceSearch(
          fetchType.FIRST,
          queryAdvanceLookUp?.[0] as AdvancedSearchMode,
          queryAdvanceLookUp?.[1] as SearchBasis
        )
      "
    >
      GO🔍
    </ui-button>
    <ui-icon-button class="q-dialog-advance-input-clear-button" icon="delete" @click="clearPrompt"> </ui-icon-button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { EnvAdapter } from '../../adapter/EnvAdapter';
import { SearchBasis } from '../../models/search/SearchBasis';
import { fetchType, promptType } from '../../models/search/SearchWindowEnum';
import { AdvancedSearchMode } from '../../models/search/AdvancedSearchModel';
import { performAdvanceSearch } from '../../services/search/performSearchQueryService';
import { useSearchStore } from '../../states/searchWindowState';

const { t } = useI18n();
const store = useSearchStore();

const promptTypeDisplayTextMap = new Map([
  [promptType.POSITIVE, t('search.advanceSearchInput.queryAdvanceChipsList.positive')],
  [promptType.NEGATIVE, t('search.advanceSearchInput.queryAdvanceChipsList.negative')],
  [promptType.COMBINED, t('search.advanceSearchInput.queryAdvanceChipsList.combined')]
]);

const queryAdvanceChipsList = ref<{ label: string; value: promptType }[]>([
  { label: t('search.advanceSearchInput.queryAdvanceChipsList.positive'), value: promptType.POSITIVE },
  { label: t('search.advanceSearchInput.queryAdvanceChipsList.negative'), value: promptType.NEGATIVE },
  { label: t('search.advanceSearchInput.queryAdvanceChipsList.combined'), value: promptType.COMBINED }
]);

const queryAdvanceModes = [
  {
    label: t('search.advanceSearchInput.queryAdvanceModes.averageVision'),
    value: '0',
    mode: [AdvancedSearchMode.average, SearchBasis.vision]
  },
  {
    label: t('search.advanceSearchInput.queryAdvanceModes.averageOCR'),
    value: '1',
    mode: [AdvancedSearchMode.average, SearchBasis.ocr]
  },
  {
    label: t('search.advanceSearchInput.queryAdvanceModes.bestVision'),
    value: '2',
    mode: [AdvancedSearchMode.best, SearchBasis.vision]
  },
  {
    label: t('search.advanceSearchInput.queryAdvanceModes.bestOCR'),
    value: '3',
    mode: [AdvancedSearchMode.best, SearchBasis.ocr]
  }
];

const clearPrompt = () => {
  store.queryAdvanceInputPromptMap.clear();
  store.queryAdvanceInput = '';
  queryAdvanceChipsList.value.map((item: { label: string; value: string }) => {
    if (item.label.indexOf('⭐') !== -1) item.label = item.label.replace('⭐', '');
  });
};

const queryAdvanceLookUp = computed(() => {
  return (
    queryAdvanceModes.find((item) => item.value === store.queryAdvanceModeBind)?.mode ?? [
      AdvancedSearchMode.average,
      SearchBasis.vision
    ]
  );
});

// perform chips render in tab 'advanced'
watch(
  () => store.queryAdvanceChipsSelectVal,
  (newVal, oldVal) => {
    // store.updateQueryAdvanceChipsList(newVal, oldVal);
    queryAdvanceChipsList.value = queryAdvanceChipsList.value.map((item: { label: string; value: promptType }) => {
      EnvAdapter.log(item);
      if (item.value === oldVal) {
        const shouldAddStar = item.label.indexOf('⭐') === -1 && store.queryAdvanceInput !== '';
        const shouldRemoveStar = item.label.indexOf('⭐') !== -1 && store.queryAdvanceInput === '';
        if (shouldAddStar) {
          item.label = `⭐${item.label}`;
        } else if (shouldRemoveStar) {
          item.label = item.label.replace('⭐', '');
        }
      }
      return item;
    });
    store.queryAdvanceInput = store.queryAdvanceInputPromptMap.get(newVal) || '';
  },
  { deep: true }
);

// Special handling of ui-select
let hiddenAdvanceSearchBtnStatus = false;
// [Ideally], considering only when the user only clicks on the dropdown box without clicking on other elements
// such as the blank part, and when not switching pages
// When handleClickStop is an odd number of times, the click is in progress and requires store.isQueryAdvanceModeClicked=true
// when it is an even number of times, the click is over and requires store.isQueryAdvanceModeClicked.value = false
const handleClickStop = (event: MouseEvent) => {
  event.stopPropagation();
  store.advanceSelectEquivalentClickCount += 1;
  store.isQueryAdvanceModeClicked = store.advanceSelectEquivalentClickCount % 2 !== 0;
  hiddenAdvanceSearchBtnStatus = false;
  EnvAdapter.log(
    'Click event stopped,',
    ' processedUpdate:',
    hiddenAdvanceSearchBtnStatus,
    'advanceSelectEquivalentClickCount:',
    store.advanceSelectEquivalentClickCount
  );
};
</script>

<style scoped>
.q-dialog-advance-set {
  transform: translateY(-20px);
}

.q-dialog-advance-set-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.q-dialog-advance-set-tip {
  font-size: 18px;
  color: gray;
  transform: translate(5px, 35px);
}

.q-dialog-advance-set-select-chips {
  transform: translate(75px, -3px);
}

.q-dialog-advance-set-select-mode {
  transform: translateX(-10px);
  transform-origin: top left;
}

.q-dialog-advance-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform: translate(0px, -10px);
  margin-bottom: -15px;
}

.q-dialog-advance-input.active {
  position: relative !important;
  z-index: -10000 !important;
}

.q-dialog-advance-input-text,
.q-dialog-advance-input-search-button {
  flex-shrink: 0;
}

.q-dialog-advance-input-text {
  padding: 8px;
  margin-right: 1em;
  width: calc(70% - 15px);
}

.q-dialog-advance-input-search-button {
  padding: 8px;
  height: 50px;
  width: 110px;
  cursor: pointer;
  margin-right: 1em;
}

.q-dialog-advance-input-search-button.active {
  visibility: hidden;
}

.q-dialog-advance-input-clear-button {
  transform: translateX(-15px);
}
</style>
