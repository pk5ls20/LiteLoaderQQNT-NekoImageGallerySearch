<template>
  <div id="search-dialog" class="q-dialog-main">
    <div class="q-dialog-all">
      <input v-model="query" @keyup.enter="performSearch" placeholder="Enter search query" class="search-input">
      <button @click="performSearch" class="search-button">Search</button>
    </div>
    <div class="search-results">
      <div v-for="img in searchResults" :key="img.id" class="search-result-item">
        <img :src="`${settings.nekoimage_api}${img.url}`"
             :alt="img.ocr_text" @click="handleImageClick(img)">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from "vue";
import {log} from "../logs";
import {adjustVisible} from "./windowLoader";
import {pluginSettings, devEnvFlag} from "./utils";

const query = ref('');
const searchResults = ref([]);
let settings = ref(null);

const add_editor = (message) => {
  try {
    let emojiElement;
    const ckeditorInstance = document.querySelector(".ck.ck-content.ck-editor__editable")["ckeditorInstance"];
    const editorModel = ckeditorInstance.model;
    const editorSelection = editorModel.document.selection;
    const position = editorSelection.getFirstPosition();
    editorModel.change(writer => {
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

const handleImageClick = (img) => {
  log(`Image Clicked: ${img.url}`);
  log(`Image ID: ${img.id}`);
  const msg = {src: `${settings.value.nekoimage_api}${img.url}`}
  if (devEnvFlag) {
    log('Dev Env: Adding editor', msg)
  } else {
    add_editor(msg);
    adjustVisible(false);
  }
};

const performSearch = async () => {
  log(settings);
  const url = `${settings.value.nekoimage_api}/search/text/${query.value}?count=80&skip=0&basis=ocr`;
  const authHeader = settings.value.nekoimage_access_token ? {'X-Access-Token': settings.value.nekoimage_access_token} : {};
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
      searchResults.value = json.result.map(r => r.img);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

onMounted(async () => {
      log('Search Window Mounted');
      settings = await pluginSettings();
      log("[Used settings111]", JSON.stringify(toRaw(settings.value)));
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
  overflow: auto;
}

.q-dialog-all {
  margin-bottom: 16px;
}

.search-input {
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: calc(100% - 16px);
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-button {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background-color: #007bff !important;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

.search-results {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 10px;
  max-height: 460px;
  overflow-y: auto;
  padding: 10px;
}

.search-result-item {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-result-item img {
  max-width: 100%;
  max-height: 100px;
  object-fit: cover;
}

</style>