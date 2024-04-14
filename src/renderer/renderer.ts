/// <reference path="../global.d.ts" />
import {injectChatFuncBarObserver} from './injectChatFuncBar'
import {addQContextMenuMain} from "./injectRightMenu";
import {settings} from "./settings";

// First, add ChatFuncBar observer, iframe and button will inject here
injectChatFuncBarObserver.observe(document.body, {childList: true, subtree: true, attributes: true});

// Then, inject right menu
await addQContextMenuMain();

// TODO: export single settings function
export const onSettingWindowCreated = settings;
