import {defineStore} from "pinia";
import {SearchResult} from "../Models/SearchResult";
import {SearchBasis} from "../Models/SearchBasis";
import {AdvancedSearchMode} from "../Models/AdvancedSearchModel";
import {pluginSettingsModel} from "../Models/pluginSettingsModel";
import {fetchStatus, promptType, searchType} from "../Models/searchWindowEnum";

export const useSearchStore = defineStore('search', {
    state: () => ({
        fetchingStatus: fetchStatus.NONE,
        lastQueryEntry: null,
        isFetchError: false,
        fetchErrorMsg: '',
        tabActiveItem: searchType.TEXT,
        searchResults: <SearchResult[]>([]),
        queryBasicInput: '',
        queryImageInput: null,
        queryAdvanceChipsList: [
            {label: 'Positive', value: promptType.POSITIVE},
            {label: 'Negative', value: promptType.NEGATIVE},
            {label: 'Combined', value: promptType.COMBINED}
        ],
        queryAdvanceChipsSelectVal: "positive",
        queryAdvanceInput: '',
        queryAdvanceInputPromptMap: new Map(),
        queryAdvanceModeBind: '0',
        isQueryAdvanceModeClicked: false,
        queryAdvanceModes: [
            {label: 'AverageVision', value: '0', mode: [AdvancedSearchMode.average, SearchBasis.vision]},
            {label: 'AverageOCR', value: '1', mode: [AdvancedSearchMode.average, SearchBasis.ocr]},
            {label: 'BestVision', value: '2', mode: [AdvancedSearchMode.best, SearchBasis.vision]},
            {label: 'BestOCR', value: '3', mode: [AdvancedSearchMode.best, SearchBasis.ocr]},
        ],
        searchResultItemOpenStates: {},
        isStatusDialogOpen: false,
        serverStatus: 0,
        serverStatusMsg: "Loading...",
        serverStatusMessage: 'Checking server...',
        serverStatusColor: 'grey',
        advanceSelectEquivalentClickCount: 0,
        pluginSettingData: new pluginSettingsModel(null, null, null)
    }),
    getters: {
        queryAdvanceLookUp: (state) => {
            const modeObject = state.queryAdvanceModes.find(mode => mode.value === state.queryAdvanceModeBind);
            return modeObject ? modeObject.mode : null;
        }
    },
    actions: {
        updateQueryAdvanceChipsList(newVal: string, oldVal: string) {
            this.queryAdvanceChipsList = this.queryAdvanceChipsList.map((item: {
                label: string,
                value: string
            }) => {
                console.log(item)
                if (item.value === oldVal) {
                    const shouldAddStar = item.label.indexOf('⭐') === -1 &&
                        this.queryAdvanceInput !== '';
                    const shouldRemoveStar = item.label.indexOf('⭐') !== -1 &&
                        this.queryAdvanceInput === '';
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