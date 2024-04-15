import { isDevEnv } from './Utils/envFlag';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import BalmUI from 'balm-ui';
import BalmUIPlus from 'balm-ui-plus';
import 'balm-ui-css';
import './index.css';

// See https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#rollupplugin-dynamic-import-vars
export function dynamicImport(entryFile: string) {
  return import(`./Components/${entryFile}.vue`);
}

export default async function AppEntry(entryFile: string, entryId: string, docContext = document) {
  const module = await import(`./Components/${entryFile}.vue`);
  const app = createApp(module.default);
  const pinia = createPinia();
  app.use(pinia).use(BalmUI).use(BalmUIPlus);
  const mountPoint = docContext.querySelector(entryId);
  if (!mountPoint) {
    console.error(`Failed to find mount point: ${entryId} in the provided document context.`);
    return;
  }
  app.mount(mountPoint);
}

if (isDevEnv) {
  const _ = await import('./dark.css');
  await AppEntry('searchWindow', '#app');
}
