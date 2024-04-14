<template>
  <div class="q-dialog-advance-set">
    <div class="q-dialog-advance-set-tip">
      Prompt
    </div>
    <div class="q-dialog-advance-set-select">
      <ui-chips
          v-model="store.queryAdvanceChipsSelectVal"
          :options="store.queryAdvanceChipsList"
          class="q-dialog-advance-set-select-chips"
          type="choice"
      ></ui-chips>
      <ui-select v-model="store.queryAdvanceModeBind"
                 :options="store.queryAdvanceModes"
                 class="q-dialog-advance-set-select-mode"
                 outlined
                 @click.stop="handleClickStop">Mode
      </ui-select>
    </div>
  </div>
  <div :class="{ 'active': store.isQueryAdvanceModeClicked }" class="q-dialog-advance-input">
    <ui-textfield v-model="store.queryAdvanceInput"
                  :change="store.queryAdvanceInputPromptMap.set(store.queryAdvanceChipsSelectVal, store.queryAdvanceInput)"
                  :dense="false"
                  :disabled="store.queryAdvanceChipsSelectVal === ''"
                  :label="store.queryAdvanceChipsSelectVal === '' ?
                                'Please Select at least one prompt!':
                                `Enter ${store.queryAdvanceChipsSelectVal} prompt...`"
                  class="q-dialog-advance-input-text"
                  outlined
                  @keyup.enter="performAdvanceSearch(fetchType.FIRST)">
    </ui-textfield>
    <ui-button :class="{ 'active': store.isQueryAdvanceModeClicked }"
               class="q-dialog-advance-input-search-button"
               raised
               @click="performAdvanceSearch(fetchType.FIRST)">GO🔍
    </ui-button>
    <ui-icon-button
        class="q-dialog-advance-input-clear-button"
        icon="delete"
        @click="clearPrompt"
    >
    </ui-icon-button>
  </div>
</template>

<script lang="ts" setup>
import {watch} from "vue";
import {EnvAdapter} from "../Adapter/EnvAdapter";
import {SearchBasis} from "../Models/SearchBasis";
import {fetchType, promptType} from "../Models/searchWindowEnum";
import {AdvancedSearchMode} from "../Models/AdvancedSearchModel";
import {performQuerySearchService} from "../Services/search/performQuerySearchService";
import {AdvancedSearchQuery, CombinedSearchQuery} from "../Services/search/searchQueryServices";
import {useSearchStore} from "../States/searchWindowState";

const store = useSearchStore()

// perform chips render in tab 'advanced'
watch(() => store.queryAdvanceChipsSelectVal, (newVal, oldVal) => {
  store.updateQueryAdvanceChipsList(newVal, oldVal);
}, {deep: true});

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
  EnvAdapter.log("Click event stopped,", " processedUpdate:", hiddenAdvanceSearchBtnStatus,
      "advanceSelectEquivalentClickCount:", store.advanceSelectEquivalentClickCount);
};

const clearPrompt = () => {
  store.queryAdvanceInputPromptMap.clear();
  store.queryAdvanceInput = '';
  store.queryAdvanceChipsList.map((item: {
    label: string,
    value: string
  }) => {
    if (item.label.indexOf('⭐') !== -1) item.label = item.label.replace('⭐', '');
  })
}

const performAdvanceSearch = async (type: fetchType) => {
  // first, decide to use which type of advance search
  // old store.queryAdvanceInputPromptMap
  let query = null;
  if (store.queryAdvanceInputPromptMap.has(promptType.COMBINED)) {
    // use combined mode
    query = new CombinedSearchQuery({
          extra_prompt: store.queryAdvanceInputPromptMap.get(promptType.COMBINED),
          criteria: [store.queryAdvanceInputPromptMap.get(promptType.POSITIVE)],  // TODO: split ' '
          negative_criteria: [store.queryAdvanceInputPromptMap.get(promptType.NEGATIVE)],
          mode: store.queryAdvanceLookUp.at(0) as AdvancedSearchMode
        },
        store.queryAdvanceLookUp.at(1) as SearchBasis
    )
  } else if (store.queryAdvanceInputPromptMap.has(promptType.POSITIVE) ||
      store.queryAdvanceInputPromptMap.has(promptType.NEGATIVE)) {
    // use advance mode
    query = new AdvancedSearchQuery({
          criteria: [store.queryAdvanceInputPromptMap.get(promptType.POSITIVE)],
          negative_criteria: [store.queryAdvanceInputPromptMap.get(promptType.NEGATIVE)],
          mode: store.queryAdvanceLookUp.at(0) as AdvancedSearchMode
        },
        store.queryAdvanceLookUp.at(1) as SearchBasis
    )
  }
  if (query) {
    await performQuerySearchService(query, type)
  }
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
  width: calc(70% - 35px);
}

.q-dialog-advance-input-search-button {
  padding: 8px;
  height: 50px;
  width: 150px;
  cursor: pointer;
  margin-right: 1em;
  transform: translateX(-8px);
}

.q-dialog-advance-input-search-button.active {
  visibility: hidden;
}

.q-dialog-advance-input-clear-button {
  transform: translateX(-15px);
}
</style>