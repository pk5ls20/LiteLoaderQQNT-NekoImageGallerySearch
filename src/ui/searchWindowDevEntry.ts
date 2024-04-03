import { createApp } from 'vue'
import searchWindow from './searchWindow.vue'
import BalmUI from 'balm-ui';
import 'balm-ui-css';
createApp(searchWindow).use(BalmUI).mount('#app')