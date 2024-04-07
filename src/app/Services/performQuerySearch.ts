import {ref} from "vue";
import {SearchQuery} from "./searchQuery";
import {useSearchStore} from "../States/searchWindowState";
import {fetchStatus, fetchType} from "../Models/searchWindowEnum";
import {SearchResult} from "../Models/SearchResult";
import {handleCatchError} from "../Utils/handleCatchError";

export const performQuerySearch = async (query: SearchQuery, type: fetchType) => {
    const store= useSearchStore()
    store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_FETCHING : fetchStatus.MORE_FETCHING
    try {
        if (type === fetchType.FIRST) {
            store.searchResults = <SearchResult[]>[]; // clear first
        }
        const response = await query.querySearch(
            20, store.searchResults.length
        )
        store.lastQueryEntry = query; // load current query into lastQueryEntryRef, waiting for load more
        store.searchResults.push(...response.result.map(r => r)); // append
        store.searchResults.forEach(it => {
            store.searchResultItemOpenStates[it.img.id] = ref(false);
        });     // add ref
        store.fetchingStatus = type === fetchType.FIRST ? fetchStatus.FIRST_SUCCESS : fetchStatus.MORE_SUCCESS
    } catch (e) {
        store.isFetchError = true;
        store.fetchingStatus = fetchStatus.NONE
        store.fetchErrorMsg = handleCatchError(e);
    }
}