<template>
  <div id="search-dialog" class="q-dialog-main">
    <ui-tab-bar
        v-model="store.tabActiveItem"
        align="center"
        @update:model-value="log('activeIndex', $event)"
    >
      <ui-tab v-for="(tab, index) in tabItem" :key="index" min-width>
        {{ tab.text }}
      </ui-tab>
    </ui-tab-bar>
    <div class="q-dialog-all" @click="handleDialogClick">
      <div v-if="store.tabActiveItem != searchType.ADVANCED" class="q-dialog-basic">
        <basic-search-input-components/>
      </div>
      <div v-if="store.tabActiveItem == searchType.ADVANCED" class="q-dialog-advance">
        <advance-search-input-components/>
      </div>
      <figure>
        <ui-progress v-if="store.fetchingStatus == fetchStatus.FIRST_FETCHING"
                     :active="true"
                     class="q-process-bar"
                     indeterminate>
        </ui-progress>
      </figure>
      <div :class="{ 'active': store.isQueryAdvanceModeClicked }" class="q-search-results">
        <search-result-components/>
      </div>
      <div class="q-status-bar">
        <status-bar-components/>
      </div>
    </div>
  </div>
  <status-dialog-components/>
</template>

<script lang="ts" setup>
import {onMounted, watch} from "vue";
import {log} from "../../logs";
import {fetchStatus, searchType, serverStatus, tabItem} from "../Models/searchWindowEnum";
import {getClient} from "../Services/baseSearchService";
import {useSearchStore} from "../States/searchWindowState";
import {adjustVisible} from "../Utils/windowLoader";
import {pluginSettings} from "../Utils/pluginSettings";
import {handleCatchError} from "../Utils/handleCatchError";
import {isDevEnv} from "../Utils/envFlag"
import BasicSearchInputComponents from "./basicSearchInputComponents.vue";
import AdvanceSearchInputComponents from "./advanceSearchInputComponents.vue";
import SearchResultComponents from "./searchResultComponents.vue";
import StatusDialogComponents from "./statusDialogComponents.vue";
import StatusBarComponents from "./statusBarComponents.vue";

const store = useSearchStore()

// Special handling of ui-select
// [Non-ideal situation], When the user clicks elsewhere and the dropdown box closes, the handleDialogClick is triggered.
// That is, when handleDialogClick is triggered and the number of times handleClickStop is an odd number of times,
// conforming to the end of the click. Let the number of times handleClickStop += 1 and store.isQueryAdvanceModeClicked=false
const handleDialogClick = () => {
  if (store.advanceSelectEquivalentClickCount % 2 !== 0) {
    store.advanceSelectEquivalentClickCount += 1;
    store.isQueryAdvanceModeClicked = false;
  }
  log("Dialog clicked, advanceSelectEquivalentClickCount:", store.advanceSelectEquivalentClickCount);
};

// Special handling of ui-select
// [Non-ideal situation] Clear the advanceSelectEquivalentClickCount counter when switching tabs.
watch(() => store.tabActiveItem, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    store.advanceSelectEquivalentClickCount = 0;
    store.isQueryAdvanceModeClicked = false;
  }
});

const checkServer = async () => {
  log("Start to checkServer...")
  const remoteEndpoint = store.pluginSettingData.nekoimage_api;
  if (remoteEndpoint !== null) {
    try {
      const client = getClient();
      const response = await client.get(`${remoteEndpoint}/`)  // TODO: maybe not suit for everybody
      const data = await response.data;
      if (data) {
        store.serverStatusMsg = JSON.stringify(data);
        const isAuthPass = (!data.authorization.required) ||
            (data.authorization.required && data.authorization.passed);
        return isAuthPass ? serverStatus.CONNECTED : serverStatus.UNAUTHORIZED;
      }
    } catch (e) {
      store.serverStatusMsg = handleCatchError(e);
      return serverStatus.DISCONNECTED;
    }
  }
  return serverStatus.DISCONNECTED;
}

onMounted(async () => {
      log('Search Window Mounted');
      // get setting
      store.pluginSettingData = await pluginSettings();
      // check status
      log(JSON.stringify(store.pluginSettingData));
      store.serverStatus = await checkServer();
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
      log("store.serverStatus", store.serverStatus)
      // listen at element in mainApp.vue, cuz <search-window></search-window> loaded on clicked button (?
      // maybe there are better ways to do this
      const searchMarkWindow = document.getElementById('search-mark-window');
      if (searchMarkWindow) {
        searchMarkWindow.addEventListener('click', () => {
          log("search-mark-window clicked")
          adjustVisible(false);
        });
      } else {
        if (!isDevEnv) {
          log('search-mark-window not found');
        }
      }
    }
);

</script>

<style scoped>
.q-dialog-main {
  transform: translate(0px, -20px);
  margin: auto 10px;
  transition: all 150ms ease-in;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
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
  bottom: 0;
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
</style>