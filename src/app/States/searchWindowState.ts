import { defineStore } from 'pinia';
import { SearchBasis } from '../Models/SearchBasis';
import { AdvancedSearchMode } from '../Models/AdvancedSearchModel';
import { pluginSettingsModel } from '../Models/pluginSettingsModel';
import { fetchStatus, promptType, searchType } from '../Models/searchWindowEnum';
import type { SearchQueryServices } from '../Services/search/searchQueryServices';
import type { SearchResult } from '../Models/SearchResult';

export const useSearchStore = defineStore('search', {
  state: () => ({
    fetchingStatus: fetchStatus.NONE as fetchStatus,
    lastQueryEntry: null as SearchQueryServices | null,
    isFetchError: false as boolean,
    fetchErrorMsg: '' as string,
    tabActiveItem: searchType.TEXT as searchType,
    searchResults: (<SearchResult[]>[]) as SearchResult[],
    queryBasicInput: '' as string,
    queryImageInput: null as string | null,
    queryAdvanceChipsList: [
      { label: 'Positive', value: promptType.POSITIVE },
      { label: 'Negative', value: promptType.NEGATIVE },
      { label: 'Combined', value: promptType.COMBINED }
    ],
    queryAdvanceChipsSelectVal: 'positive' as string,
    queryAdvanceInput: '' as string,
    queryAdvanceInputPromptMap: new Map() as Map<string, string>,
    queryAdvanceModeBind: '0' as string,
    isQueryAdvanceModeClicked: false as boolean,
    queryAdvanceModes: [
      {
        label: 'AverageVision',
        value: '0',
        mode: [AdvancedSearchMode.average, SearchBasis.vision]
      },
      { label: 'AverageOCR', value: '1', mode: [AdvancedSearchMode.average, SearchBasis.ocr] },
      { label: 'BestVision', value: '2', mode: [AdvancedSearchMode.best, SearchBasis.vision] },
      { label: 'BestOCR', value: '3', mode: [AdvancedSearchMode.best, SearchBasis.ocr] }
    ],
    searchResultItemOpenStates: {} as {
      [key: string]: boolean;
    },
    isStatusDialogOpen: false as boolean,
    serverStatus: 0 as number,
    serverStatusMsg: 'Loading...' as string,
    serverStatusMessage: 'Checking server...' as string,
    serverStatusColor: 'grey' as string,
    advanceSelectEquivalentClickCount: 0 as number,
    pluginSettingData: new pluginSettingsModel('', '', '') as pluginSettingsModel
  }),
  getters: {
    queryAdvanceLookUp: (state) => {
      const modeObject = state.queryAdvanceModes.find((mode) => mode.value === state.queryAdvanceModeBind);
      return modeObject ? modeObject.mode : null;
    }
  },
  actions: {
    updateQueryAdvanceChipsList(newVal: string, oldVal: string) {
      this.queryAdvanceChipsList = this.queryAdvanceChipsList.map((item: { label: string; value: promptType }) => {
        console.log(item);
        if (item.value === oldVal) {
          const shouldAddStar = item.label.indexOf('⭐') === -1 && this.queryAdvanceInput !== '';
          const shouldRemoveStar = item.label.indexOf('⭐') !== -1 && this.queryAdvanceInput === '';
          if (shouldAddStar) {
            item.label = `⭐${item.label}`;
          } else if (shouldRemoveStar) {
            item.label = item.label.replace('⭐', '');
          }
        }
        return item;
      });
      this.queryAdvanceInput = this.queryAdvanceInputPromptMap.get(newVal) || '';
    }
  }
});
