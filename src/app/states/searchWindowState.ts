import { defineStore } from 'pinia';
import { sharedAdapter } from '../adapter/SharedAdapter';
import { SearchBasis } from '../models/search/SearchBasis';
import { AdvancedSearchMode } from '../models/search/AdvancedSearchModel';
import { fetchStatus, promptType, searchType } from '../models/search/SearchWindowEnum';
import type { SearchQueryService } from '../services/search/searchQueryService';
import type { SearchResult } from '../models/search/SearchResult';
import { SearchFilterOptions } from '../models/search/SearchFilterOptions';

export const useSearchStore = defineStore('search', {
  state: () => ({
    fetchingStatus: fetchStatus.NONE as fetchStatus,
    lastQueryEntry: null as SearchQueryService | null,
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
    ] as { label: string; value: promptType }[],
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
    ] as { label: string; value: string; mode: AdvancedSearchMode | SearchBasis[] }[],
    searchResultItemOpenStates: {} as {
      [key: string]: boolean;
    },
    isStatusDialogOpen: false as boolean,
    serverStatus: 0 as number,
    serverStatusMsg: 'Loading...' as string,
    serverStatusMessage: 'Checking server...' as string,
    serverStatusColor: 'grey' as string,
    advanceSelectEquivalentClickCount: 0 as number,
    pluginSettingData: new sharedAdapter.PluginSettingsModel('', '', '') as sharedAdapter.PluginSettingsModelType,
    filterOptions: new SearchFilterOptions() as SearchFilterOptions,
    isFilterOptionsDialogOpen: false as boolean,
    filterAspectRatioEnabled: false as boolean,
    minSizeEnabled: false as boolean,
    categoriesEnabled: false as boolean,
    negativeCategoriesEnabled: false as boolean
  }),
  getters: {
    queryAdvanceLookUp: (state) => {
      const modeObject = state.queryAdvanceModes.find((mode) => mode.value === state.queryAdvanceModeBind);
      return modeObject ? modeObject.mode : null;
    },
    isEnableFilterOptions: (state) => {
      return Object.values(state.filterOptions).some((value) => (Array.isArray(value) ? value.length > 0 : !!value));
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
