import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import SearchWindow from '../views/searchWindow.vue';
import uploadWindow from '../views/uploadWindow.vue';

type ActiveComponentType = typeof SearchWindow | typeof uploadWindow;

export const useMainStore = defineStore('main', {
  state: () => ({
    mainWindowShowMark: false as boolean,
    mainWindowActiveComponent: shallowRef<ActiveComponentType>(SearchWindow),
    mainWindowUseCSSAnimate: false as boolean
  })
});
