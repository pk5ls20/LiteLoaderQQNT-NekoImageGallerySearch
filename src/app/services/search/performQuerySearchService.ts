import type { SearchResult } from '../../models/search/SearchResult';
import { SearchQueryService } from './searchQueryService';
import { fetchStatus, fetchType } from '../../models/search/SearchWindowEnum';
import { useSearchStore } from '../../states/searchWindowState';
import { displayErrorDialog } from '../../utils/handleCatchError';

export const performQuerySearchService = async (query: SearchQueryService, type: fetchType) => {
  const store = useSearchStore();
  store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_FETCHING : fetchStatus.MORE_FETCHING;
  try {
    if (type === fetchType.FIRST) {
      store.searchResults = <SearchResult[]>[]; // clear first
    }
    const response = await query.querySearch(20, store.searchResults.length);
    store.lastQueryEntry = query; // load current query into lastQueryEntryRef, waiting for load more
    store.searchResults.push(...response.result.map((r) => r)); // append
    store.searchResults.forEach((it) => {
      store.searchResultItemOpenStates[it.img.id] = false;
    }); // add ref
    store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_SUCCESS : fetchStatus.MORE_SUCCESS;
  } catch (e) {
    displayErrorDialog(e);
  }
};
