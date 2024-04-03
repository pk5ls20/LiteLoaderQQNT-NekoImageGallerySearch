<template>
  <div id="search-dialog" class="q-dialog-main">
    <ui-tab-bar v-model="tabActiveItemRef" align="center">
      <ui-tab v-for="(tab, index) in tabItem" :key="index" min-width>
        {{ tab.text }}
      </ui-tab>
    </ui-tab-bar>
    <div class="q-dialog-all">
      <div class="q-dialog-input">
        <ui-textfield v-model="queryInputRef"
                      :dense="false"
                      class="q-dialog-search-input"
                      outlined
                      @keyup.enter="performSearch">
          Search...
        </ui-textfield>
        <ui-button class="q-dialog-search-button" raised @click="performSearch">GO🔍</ui-button>
        <ui-icon-button icon="casino"></ui-icon-button>
      </div>
      <div class="q-search-results">
        <div v-for="img in searchResultsRef" :key="img.id" class="q-search-result-item">
          <img :alt="img.ocr_text"
               :src="`${pluginSettingsRef.nekoimage_api}${img.url}`" @click="handleImageClick(img)">
        </div>
      </div>
      <div class="q-status-bar">
        <ui-chips>
          <ui-chip class="q-status-bar-state" @click="toggleDialog" :style="{ color: serverStatusColorRef }">
            <span class="q-status-bar-state-button">●</span>
            <span class="q-status-bar-state-text">{{ serverStatusMessageRef }}</span>
          </ui-chip>
        </ui-chips>
      </div>
    </div>
  </div>
  <ui-dialog v-model="isDialogOpenRef" class="q-status-dialog" fullscreen>
    <ui-dialog-title>
      Server Status
    </ui-dialog-title>
    <ui-dialog-content v-if="pluginSettingsRef">
      {{serverStatusMsgRef}}
    </ui-dialog-content>
    <ui-dialog-actions>
      <ui-button @click="isDialogOpenRef = false">OK</ui-button>
    </ui-dialog-actions>
  </ui-dialog>
</template>

<script lang="ts" setup>
import {onMounted, ref, toRaw} from "vue";
import {log} from "../logs";
import {adjustVisible, windowVisibleState} from "./windowLoader";
import {isDevEnv, pluginSettings} from "./utils";

const isDialogOpenRef = ref(true);
const queryInputRef = ref('');
const searchResultsRef = ref([]);
const tabActiveItemRef = ref(0);
const serverStatusMsgRef = ref("???");
const serverStatusRef = ref(0);
const serverStatusMessageRef = ref('Checking server...');
const serverStatusColorRef = ref('grey');
let pluginSettingsRef = ref(null);

const tabItem = [
  {text: 'TEXT'},
  {text: 'OCR'},
  {text: 'ADVANCED'}
];

enum serverStatus {
  CONNECTED = 0,
  UNAUTHORIZED = 1,
  DISCONNECTED = 2
}

enum searchType {
  TEXT = 0,
  OCR = 1,
  ADVANCED = 2,
}

const toggleDialog = () => {
  isDialogOpenRef.value = !isDialogOpenRef.value;
};

const add_editor = (message: {
  src: string;
}) => {
  try {
    let emojiElement;
    const ckeditorInstance = document.querySelector(".ck.ck-content.ck-editor__editable")["ckeditorInstance"];
    const editorModel = ckeditorInstance.model;
    const editorSelection = editorModel.document.selection;
    const position = editorSelection.getFirstPosition();
    editorModel.change((writer: any) => {
      const data = {
        "type": "pic",
        "src": message.src,
        "picSubType": 0
      }
      const emojiData = {
        data: JSON.stringify(data)
      }
      emojiElement = writer.createElement('msg-img', emojiData);
      writer.insert(emojiElement, position);
    });
  } catch (error) {
    log(error)
  }
}

const handleImageClick = (img: {
  url: string;
  id: string;
}) => {
  log(`Image Clicked: ${img.url}`);
  log(`Image ID: ${img.id}`);
  const msg = {src: `${pluginSettingsRef.value.nekoimage_api}${img.url}`}
  if (isDevEnv) {
    log('Dev Env: Adding editor', msg)
  } else {
    add_editor(msg);
    windowVisibleState.value = false;
    adjustVisible(false);
  }
};

const performSearch = async () => {
  log(pluginSettingsRef);
  const url = `${pluginSettingsRef.value.nekoimage_api}/search/text/${queryInputRef.value}?count=80&skip=0&basis=ocr`;
  const authHeader = pluginSettingsRef.value.nekoimage_access_token ? {'X-Access-Token': pluginSettingsRef.value.nekoimage_access_token} : {};
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeader
    });
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const json = await response.json();
    if (json && json.result) {
      searchResultsRef.value = json.result.map(r => r.img);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

const checkServer = async () =>{
  log("Start to checkServer...")
  const remoteEndpoint = pluginSettingsRef.value.nekoimage_api;
  const authHeader = pluginSettingsRef.value.nekoimage_access_token ? {'X-Access-Token': pluginSettingsRef.value.nekoimage_access_token} : {};
  if (remoteEndpoint !== null){
    try{
      const response = await fetch(`${remoteEndpoint}/`, {
        method: 'GET',
        headers: authHeader
      })
      if (!response.ok) {
        serverStatusMsgRef.value = `Cannot connect to server due to response.statusText=${response.statusText}`
        return serverStatus.DISCONNECTED;
      }
      const jsonData = await response.json();
      if (jsonData) {
        serverStatusMsgRef.value = JSON.stringify(jsonData);
        const isAuthPass = (!jsonData.authorization.required) ||
            (jsonData.authorization.required && jsonData.authorization.passed);
        return isAuthPass ? serverStatus.CONNECTED : serverStatus.UNAUTHORIZED;
      }
    }
    catch (e){
      serverStatusMsgRef.value = `Cannot connect to server due to error: ${e.stack.toString()}`
      return serverStatus.DISCONNECTED;
    }
  }
  return serverStatus.DISCONNECTED;
}

onMounted(async () => {
      log('Search Window Mounted');
      pluginSettingsRef = await pluginSettings();
      log(JSON.stringify(toRaw(pluginSettingsRef.value)));
      serverStatusRef.value = await checkServer();
      switch (serverStatusRef.value) {
        case serverStatus.CONNECTED:
          serverStatusMessageRef.value = 'Server Connected';
          serverStatusColorRef.value = 'green';
          break;
        case serverStatus.UNAUTHORIZED:
          serverStatusMessageRef.value = 'Server Unauthorized';
          serverStatusColorRef.value = 'red';
          break;
        case serverStatus.DISCONNECTED:
          serverStatusMessageRef.value = 'Server Disconnected';
          serverStatusColorRef.value = 'grey';
          break;
      }
      log("serverStatusRef.value", serverStatusRef.value)
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
  height: 500px;
  width: 600px;
  overflow: auto;
}

.q-dialog-all {
  margin-top: 10px;
  margin-bottom: 16px;
}

.q-dialog-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.q-dialog-search-input {
  padding: 8px;
  width: calc(90% - 16px);
  margin-right: 1em;
}

.q-dialog-search-button {
  padding: 8px;
  height: 55px;
  width: calc(40% - 10px);
  background-color: #007bff !important;
  color: white;
  cursor: pointer;
  margin-right: 1em;
}

.q-search-results {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 10px;
  max-height: 330px;
  overflow-y: auto;
  padding: 10px;
  margin-top: 5px;
}

.q-search-result-item {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-search-result-item img {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
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

.q-status-bar-state {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
}

.q-status-bar-state-button {
  font-size: 28px;
  margin: 0 1px;
  position: relative;
  top: 1px;
}

.q-status-bar-state-text {
  font-size: 14px;
  margin: 0 1px;
  position: relative;
  top: -2px;
}
</style>