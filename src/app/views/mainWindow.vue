<template>
  <div class="q-main">
    <Transition :name="store.mainWindowUseCSSAnimate ? 'component' : ''" mode="out-in">
      <keep-alive>
        <search-window v-if="store.mainWindowActiveComponent === SearchWindow" key="searchWindow" />
        <upload-window v-else key="uploadWindow" />
      </keep-alive>
    </Transition>
    <upload-trigger-helper :style="{ display: 'none' }" />
    <div v-if="store.mainWindowShowMark" class="spread-mask"></div>
    <search-snackbar />
    <upload-confirm-snackbar />
  </div>
</template>

<script lang="ts" setup>
import { useMainStore } from '../states/mainWindowState';
import SearchSnackbar from '../components/search/searchSnackbar.vue';
import UploadConfirmSnackbar from '../components/upload/uploadConfirmSnackbar.vue';
import SearchWindow from './searchWindow.vue';
import UploadWindow from './uploadWindow.vue';
import UploadTriggerHelper from '../components/upload/uploadTriggerHelper.vue';

const store = useMainStore();
</script>

<style scoped>
.q-main {
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
  overflow-x: hidden;
}

@keyframes spread-effect {
  from {
    clip-path: circle(0% at 100% 100%);
  }
  to {
    clip-path: circle(150% at 100% 100%);
  }
}

.spread-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  animation: spread-effect 400ms ease-out forwards;
}

@media (prefers-color-scheme: dark) {
  .spread-mask {
    background-color: #242525;
  }
}

.component-enter-active,
.component-leave-active {
  transition:
    transform 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
}

.component-enter,
.component-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.component-enter-to,
.component-leave {
  opacity: 1;
}
</style>
