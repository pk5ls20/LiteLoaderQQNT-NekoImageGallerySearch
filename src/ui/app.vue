<template>
  <div id="search-window" class="q-dialog">
    <div id="search-mark-window" class="q-dialog-modal"></div>
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
  </div>
</template>


<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import iconHtml from '../assets/svg/logo.svg?raw';

const query = ref('');
const searchResults = ref([]);
const settings = ref({
  nekoimage_api: '',
  nekoimage_access_token: '',
  nekoimage_admin_token: ''
});
const isVisible = ref(false);

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
    console.log(error)
  }
}

const visible = (state: boolean) => {
  const nekoImageWindow = document.getElementById('search-window');
  const nekoImageMarkWindow = document.getElementById('search-mark-window');
  const nekoImageDialog = document.getElementById('search-dialog');
  if (state){
    isVisible.value = true;
    nekoImageWindow.style.visibility = 'visible';
    nekoImageMarkWindow.style.transitionDelay = '0ms';
    nekoImageDialog.style.transitionDelay = '150ms';
    nekoImageMarkWindow.style.opacity = '1';
    nekoImageDialog.style.opacity = '1';
    nekoImageDialog.style.transform = 'translate(0px, 0px)';
  }
  else{
    nekoImageWindow.style.visibility = 'hidden';
    nekoImageMarkWindow.style.transitionDelay = '150ms';
    nekoImageDialog.style.transitionDelay = '0ms';
    nekoImageMarkWindow.style.opacity = '0';
    nekoImageDialog.style.opacity = '0';
    nekoImageDialog.style.transform = 'translate(0px, -20px)';
  }
}

const hideWindow = () => {
  isVisible.value = false;
  const nekoImageWindow = document.getElementById('search-window');
  const nekoImageMarkWindow = document.getElementById('search-mark-window');
  const nekoImageDialog = document.getElementById('search-dialog');
  if (nekoImageWindow && nekoImageMarkWindow && nekoImageDialog) {
    visible(false);
  }
};

const handleImageClick = (img) => {
  console.log(`Image Clicked: ${img.url}`);
  console.log(`Image ID: ${img.id}`);
  add_editor({
    "src": `${settings.value.nekoimage_api}${img.url}`
  });
  hideWindow();
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const nodes = Array.from(mutation.addedNodes);
      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node["classList"].contains('chat-func-bar')) {
          const funcBar = node.getElementsByTagName('div')[0];
          const openButton = funcBar.lastElementChild.cloneNode(true);
          const icon = openButton.getElementsByTagName('i')[0];
          icon.innerHTML = iconHtml;
          const nekoImageWindow = document.getElementById('search-window');
          const nekoImageMarkWindow = document.getElementById('search-mark-window');
          const nekoImageDialog = document.getElementById('search-dialog');
          console.log("[capture]", nekoImageWindow, nekoImageMarkWindow, nekoImageDialog);
          openButton.addEventListener('click', () => {
            visible(true);
          });
          funcBar.appendChild(openButton);
        }
      });
    }
  });
});

const performSearch = async () => {
  console.log(settings.value);
  const url = `${settings.value.nekoimage_api}/search/text/${query.value}?count=80&skip=0&basis=ocr`;
  const authHeader = settings.value.nekoimage_access_token ? { 'X-Access-Token': settings.value.nekoimage_access_token } : {};
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
  settings.value = await window.imageSearch.getSettings();
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  const nekoImageMarkWindow = document.getElementById('search-mark-window');
  if (nekoImageMarkWindow) {
    nekoImageMarkWindow.addEventListener('click', hideWindow);
  }
  console.log('Mounted', JSON.stringify(settings.value));
});

onUnmounted(() => {
  observer.disconnect();
  const nekoImageMarkWindow = document.getElementById('search-mark-window');
  if (nekoImageMarkWindow) {
    nekoImageMarkWindow.removeEventListener('click', hideWindow);
  }
});

</script>


<style scoped>
.q-dialog{
  visibility: hidden;
  position: fixed;
  z-index: 4999;
  transition: all 300ms;
}

.q-dialog-modal{
  opacity: 0;
  position: inherit;
  background: var(--overlay_mask_dark);
  transition: all 150ms ease-in;
}

.q-dialog-main{
  transform: translate(0px, -20px);
  opacity: 0;
  margin: auto 10px;
  transition: all 150ms ease-in;
  padding: 16px;
}

.q-dialog-all{
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

.search-results{
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

#search-dialog {
  opacity: 0;
  margin: auto;
  transition: all 150ms ease-in;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
}
</style>