import type { SearchResult } from '../../models/search/SearchResult';
import {
  AdvancedSearchQuery,
  CombinedSearchQuery,
  ImageSearchQuery,
  RandomSearchQuery,
  SearchQueryService,
  SimilarSearchQuery,
  TextSearchQuery
} from './searchQueryService';
import { fetchStatus, fetchType, promptType, searchType } from '../../models/search/SearchWindowEnum';
import { useSearchStore } from '../../states/searchWindowState';
import { displaySearchErrorDialog } from '../../utils/handleCatchError';
import { SearchBasis } from '../../models/search/SearchBasis';
import type { Image } from '../../models/search/Image';
import { AdvancedSearchMode } from '../../models/search/AdvancedSearchModel';
import { getClient } from './baseSearchService';

// TODO: refactor
export const performBasicSearch = async (type: fetchType) => {
  const store = useSearchStore();
  const query = new TextSearchQuery(
    store.queryBasicInput,
    store.tabActiveItem === searchType.TEXT ? SearchBasis.vision : SearchBasis.ocr,
    false
  );
  await performSearchQueryService(query, type);
};

export const performRandomSearch = async () => {
  await performSearchQueryService(new RandomSearchQuery(), fetchType.FIRST);
};

export const performImageSearch = async (imageFile: File | Blob) => {
  const store = useSearchStore();
  store.queryImageInput = URL.createObjectURL(imageFile);
  const req = new ImageSearchQuery(imageFile);
  await performSearchQueryService(req, fetchType.FIRST);
};

// TODO: refactor
export const performLoadMoreSearch = async () => {
  const store = useSearchStore();
  // store.lastQueryEntry must not be null
  await performSearchQueryService(store.lastQueryEntry as SearchQueryService, fetchType.MORE);
};

export const performSimilarSearch = async (searchImage: Image, type: fetchType) => {
  // download
  const store = useSearchStore();
  const imgObj = await getClient().get<Blob>(searchImage.url, { responseType: 'blob' });
  store.queryImageInput = URL.createObjectURL(imgObj.data);
  const query = new SimilarSearchQuery(searchImage);
  await performSearchQueryService(query, type);
};

// TODO: refactor
export const performAdvanceSearch = async (type: fetchType, mode: AdvancedSearchMode, basis: SearchBasis) => {
  // first, decide to use which type of advance search
  // old store.queryAdvanceInputPromptMap
  const store = useSearchStore();
  let query = null;
  if (store.queryAdvanceInputPromptMap.has(promptType.COMBINED)) {
    // use combined mode
    query = new CombinedSearchQuery(
      {
        extra_prompt: store.queryAdvanceInputPromptMap.get(promptType.COMBINED) ?? '',
        criteria: [store.queryAdvanceInputPromptMap.get(promptType.POSITIVE) ?? ''], // TODO: split ' '
        negative_criteria: [store.queryAdvanceInputPromptMap.get(promptType.NEGATIVE) ?? ''],
        mode: mode
      },
      basis
    );
  } else if (
    store.queryAdvanceInputPromptMap.has(promptType.POSITIVE) ||
    store.queryAdvanceInputPromptMap.has(promptType.NEGATIVE)
  ) {
    // use advance mode
    query = new AdvancedSearchQuery(
      {
        criteria: [store.queryAdvanceInputPromptMap.get(promptType.POSITIVE) ?? ''],
        negative_criteria: [store.queryAdvanceInputPromptMap.get(promptType.NEGATIVE) ?? ''],
        mode: mode
      },
      basis
    );
  }
  if (query) {
    await performSearchQueryService(query, type);
  }
};

const performSearchQueryService = async (query: SearchQueryService, type: fetchType) => {
  const store = useSearchStore();
  store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_FETCHING : fetchStatus.MORE_FETCHING;
  try {
    if (type === fetchType.FIRST) {
      store.searchResults = <SearchResult[]>[]; // clear first
    }
    query.filterOptions = store.filterOptions;
    const response = await query.querySearch(20, store.searchResults.length);
    store.lastQueryEntry = query; // load current query into lastQueryEntryRef, waiting for load more
    store.searchResults.push(...response.result.map((r) => r)); // append
    store.searchResults.forEach((it) => {
      store.searchResultItemOpenStates[it.img.id] = false;
    }); // add ref
    store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_SUCCESS : fetchStatus.MORE_SUCCESS;
  } catch (e) {
    displaySearchErrorDialog(e);
  }
};
