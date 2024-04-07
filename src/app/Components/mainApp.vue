<template>
  <div id="search-window" v-if=localVisibleState class="q-dialog">
    <div id="search-mark-window" class="q-dialog-modal"></div>
    <search-window></search-window>
  </div>
</template>


<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {log} from "../../logs";
import iconHtml from '../../assets/logo.svg?raw';
import SearchWindow from "./searchWindow.vue";
import {adjustVisible} from "../Utils/windowLoader";
import {windowVisibleState} from "../Utils/windowLoader";
const localVisibleState = ref(false);

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
          log("[capture]", nekoImageWindow, nekoImageMarkWindow, nekoImageDialog);
          localVisibleState.value = true;
          openButton.addEventListener('click', () => {
            log("[click]", windowVisibleState.value);
            windowVisibleState.value = true;
            adjustVisible(true);
          });
          funcBar.appendChild(openButton);
        }
      });
    }
  });
});


onMounted(async () => {
  observer.observe(document.body, {childList: true, subtree: true, attributes: true});
});

onUnmounted(() => {
  observer.disconnect();
});

</script>


<style scoped>
.q-dialog {
  opacity: 0;
  visibility: hidden;
  position: fixed;
  z-index: 4999;
  transition: all 300ms;
}

.q-dialog-modal {
  position: inherit;
  background: var(--overlay_mask_dark);
  transition: all 150ms ease-in;
}

</style>