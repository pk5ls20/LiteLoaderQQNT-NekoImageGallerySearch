/// <reference path="../global.d.ts" />
import { injectChatFuncBar } from './inject/injectChatFuncBar';
import { addQContextMenuMain } from './inject/injectRightMenu';
import { settings } from './setting/settings';
import { injectMultipleSelection } from './inject/injectMultipleSelection';
import { iframeID, setupIframe } from './iframe/injectIframe';
import { showIframe } from './iframe/controlIframe';

// First, add ChatFuncBar observer, iframe and button will inject here
await injectChatFuncBar(setupIframe(), async () => {
  window.imageSearch.triggerSettingReq(null);
  showIframe(iframeID);
});
// Then, observe and trigger action
injectMultipleSelection();
// Then, inject right menu
await addQContextMenuMain();
// TODO: export single settings function
export const onSettingWindowCreated = settings;
