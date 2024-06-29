import { isDevEnv } from './utils/envFlag';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';
import BalmUI from 'balm-ui';
import BalmUIPlus from 'balm-ui-plus';
import 'balm-ui-css';
import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import './index.css';

type MessageSchema = typeof enUS;

export default async function AppEntry(
  entryFile: string,
  entryId: string,
  docContext = document,
  locale: 'en-US' | 'zh-CN' = 'en-US'
) {
  const module = await import(`./views/${entryFile}.vue`);
  const app = createApp(module.default);
  const pinia = createPinia();
  const i18n = createI18n<[MessageSchema], 'en-US' | 'zh-CN'>({
    legacy: false,
    locale: locale,
    fallbackLocale: 'en-US',
    messages: {
      'en-US': enUS,
      'zh-CN': zhCN
    }
  });
  app.use(pinia).use(i18n).use(BalmUI).use(BalmUIPlus).use(VueVirtualScroller);
  const mountPoint = docContext.querySelector(entryId);
  if (!mountPoint) {
    console.error(`Failed to find mount point: ${entryId} in the provided document context.`);
    return;
  }
  app.mount(mountPoint);
}

if (isDevEnv) {
  await AppEntry('mainWindow', '#app');
}
