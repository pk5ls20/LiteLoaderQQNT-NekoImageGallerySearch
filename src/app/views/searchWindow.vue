<template>
  <div id="search-dialog" class="q-dialog-main">
    <ui-tab-bar
      v-model="store.tabActiveItem"
      align="center"
      @update:model-value="EnvAdapter.log('activeIndex', $event)"
    >
      <ui-tab v-for="(tab, index) in tabItem" :key="index" min-width>
        {{ tab.text }}
      </ui-tab>
    </ui-tab-bar>
    <div class="q-dialog-all" @click="handleDialogClick">
      <div v-show="isBasicSearch()" class="q-dialog-basic">
        <basic-search-input-components />
      </div>
      <div v-show="store.tabActiveItem === searchType.IMAGE" class="q-dialog-advance">
        <image-search-input-components />
      </div>
      <div v-show="store.tabActiveItem === searchType.ADVANCED" class="q-dialog-advance">
        <advance-search-input-components />
      </div>
      <figure>
        <ui-progress
          v-show="store.fetchingStatus == fetchStatus.FIRST_FETCHING"
          :active="true"
          class="q-process-bar"
          indeterminate
        >
        </ui-progress>
      </figure>
      <div
        :class="{
          active: store.isQueryAdvanceModeClicked,
          basic_search: isBasicSearch(),
          not_basic_search: !isBasicSearch()
        }"
        class="q-search-results"
      >
        <search-result-components />
      </div>
      <div class="q-status-bar">
        <status-bar-components />
      </div>
    </div>
  </div>
  <status-dialog-components />
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { EnvAdapter } from '../adapter/EnvAdapter';
import { fetchStatus, searchType, serverStatus, tabItem } from '../models/search/SearchWindowEnum';
import { resetClient } from '../services/search/baseSearchService';
import { useSearchStore } from '../states/searchWindowState';
import BasicSearchInputComponents from '../components/basicSearchInput.vue';
import imageSearchInputComponents from '../components/imageSearchInput.vue';
import AdvanceSearchInputComponents from '../components/advanceSearchInput.vue';
import SearchResultComponents from '../components/searchResult.vue';
import StatusDialogComponents from '../components/statusDialog.vue';
import StatusBarComponents from '../components/statusBar.vue';
import { checkServer } from '../utils/checkServer';
import { sha256 } from '../utils/sha256';

const store = useSearchStore();

const isBasicSearch = () => searchType.TEXT <= store.tabActiveItem && store.tabActiveItem <= searchType.OCR;

// Special handling of ui-select
// [Non-ideal situation], When the user clicks elsewhere and the dropdown box closes, the handleDialogClick is triggered.
// That is, when handleDialogClick is triggered and the number of times handleClickStop is an odd number of times,
// conforming to the end of the click. Let the number of times handleClickStop += 1 and store.isQueryAdvanceModeClicked=false
const handleDialogClick = () => {
  if (store.advanceSelectEquivalentClickCount % 2 !== 0) {
    store.advanceSelectEquivalentClickCount += 1;
    store.isQueryAdvanceModeClicked = false;
  }
  EnvAdapter.log('Dialog clicked, advanceSelectEquivalentClickCount:', store.advanceSelectEquivalentClickCount);
};

// Special handling of ui-select
// [Non-ideal situation] Clear the advanceSelectEquivalentClickCount counter when switching tabs.
watch(
  () => store.tabActiveItem,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      store.advanceSelectEquivalentClickCount = 0;
      store.isQueryAdvanceModeClicked = false;
    }
  }
);

const handleSettingChange = async (setting_data: string | null) => {
  // get setting
  if (setting_data) {
    EnvAdapter.log('received setting data from arg');
    store.pluginSettingData = JSON.parse(setting_data);
  } else {
    EnvAdapter.log('setting_data is null, get setting from EnvAdapter.getSettings()');
    store.pluginSettingData = await EnvAdapter.getSettings();
  }
  // reset client to use new setting
  resetClient(store.pluginSettingData);
  // check status
  const outputSettingData = {
    nekoimage_api: store.pluginSettingData.nekoimage_api,
    nekoimage_access_token_sha256: await sha256(store.pluginSettingData.nekoimage_access_token),
    nekoimage_admin_token_sha256: await sha256(store.pluginSettingData.nekoimage_admin_token)
  };
  EnvAdapter.log('store.pluginSettingData', outputSettingData);
  const checkStatusResult = await checkServer(store.pluginSettingData.nekoimage_api);
  store.serverStatus = checkStatusResult.status;
  store.serverStatusMsg = checkStatusResult.message;
  switch (store.serverStatus) {
    case serverStatus.CONNECTED:
      store.serverStatusMessage = 'Server Connected';
      store.serverStatusColor = 'green';
      break;
    case serverStatus.UNAUTHORIZED:
      store.serverStatusMessage = 'Server Unauthorized';
      store.serverStatusColor = 'red';
      break;
    case serverStatus.DISCONNECTED:
      store.serverStatusMessage = 'Server Disconnected';
      store.serverStatusColor = 'grey';
      break;
  }
  EnvAdapter.log('store.serverStatus', store.serverStatus);
};

onMounted(async () => {
  EnvAdapter.log('Search Window Mounted');
  await handleSettingChange(null);
  EnvAdapter.triggerSettingService().init(handleSettingChange);
});
</script>

<style scoped>
.q-dialog-main {
  transform: translate(0px, -20px);
  margin: auto 10px;
  transition: all 150ms ease-in;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  height: 600px;
  width: 650px;
  overflow: auto;
}

.q-dialog-all {
  margin-top: 10px;
  margin-bottom: 16px;
}

.q-dialog-basic {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.q-search-results {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  margin-top: 5px;
  width: 630px;
  height: 400px;
  transform: translateX(-10px);
}

.q-status-bar {
  position: fixed;
  left: 450px;
  right: 0;
  bottom: 10px;
  width: auto;
  margin: auto;
  display: flex;
  justify-content: center;
  color: black;
}

.q-process-bar {
  transform: scaleX(115%);
}

.q-search-results.active {
  position: relative !important;
  z-index: -10000 !important;
}

.q-search-results.basic_search {
  height: 400px;
}

.q-search-results.not_basic_search {
  height: 330px;
}
</style>
