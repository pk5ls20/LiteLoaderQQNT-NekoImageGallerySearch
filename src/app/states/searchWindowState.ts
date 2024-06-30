import { defineStore } from 'pinia';
import { sharedAdapter } from '../adapter/SharedAdapter';
import {
  fetchStatus,
  promptType,
  searchType,
  serverAdminAPIStatus,
  serverAuthStatus
} from '../models/search/SearchWindowEnum';
import type { SearchQueryService } from '../services/search/searchQueryService';
import type { SearchResult } from '../models/search/SearchResult';
import type { HomeApiResponse } from '../models/search/HomeApiResponse';
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
    queryAdvanceChipsSelectVal: promptType.POSITIVE as string,
    queryAdvanceInput: '' as string,
    queryAdvanceInputPromptMap: new Map() as Map<string, string>,
    queryAdvanceModeBind: '0' as string,
    isQueryAdvanceModeClicked: false as boolean,
    searchResultItemOpenStates: {} as {
      [key: string]: boolean;
    },
    isStatusDialogOpen: false as boolean,
    serverStatus: 0 as number,
    serverStatusMsg: null as string | null,
    serverStatusMessage: null as string | null,
    serverStatusColor: 'grey' as string,
    serverCheckResult: null as HomeApiResponse | null,
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
    isEnableFilterOptions: (state) => {
      return Object.values(state.filterOptions).some((value) => (Array.isArray(value) ? value.length > 0 : !!value));
    },
    serverOCRAvailable: (state) => {
      return state.serverCheckResult?.available_basis?.includes('ocr') ?? false;
    },
    serverAdminAvailable: (state) => {
      return (
        (state.serverCheckResult?.admin_api.available ?? false) && (state.serverCheckResult?.admin_api.passed ?? false)
      );
    },
    serverAuthorizationRenderItem: (state) => {
      const { required: req = false, passed: pass = false } = state.serverCheckResult?.authorization ?? {};
      return req
        ? pass
          ? serverAuthStatus.REQUIRE_PASSED
          : serverAuthStatus.REQUIRE_NOT_PASSED
        : pass
          ? serverAuthStatus.NOT_REQUIRE_PASSED
          : serverAuthStatus.NOT_REQUIRE_NOT_PASSED;
    },
    serverAdminAPIRenderItem: (state) => {
      const { available: a = false, passed = false } = state.serverCheckResult?.admin_api ?? {};
      return a
        ? passed
          ? serverAdminAPIStatus.AVAILABLE_PASSED
          : serverAdminAPIStatus.AVAILABLE_NOT_PASSED
        : passed
          ? serverAdminAPIStatus.NOT_AVAILABLE_PASSED
          : serverAdminAPIStatus.NOT_AVAILABLE_NOT_PASSED;
    }
  }
});
