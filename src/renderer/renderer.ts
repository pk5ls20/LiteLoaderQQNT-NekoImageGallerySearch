/// <reference path="../global.d.ts" />
import {injectChatFuncBarObserver} from './injectChatFuncBar'
import {settings} from "./settings";

// First, add ChatFuncBar observer, iframe and button will inject here
injectChatFuncBarObserver.observe(document.body, {childList: true, subtree: true, attributes: true});

// TODO: export single settings function
export const onSettingWindowCreated = settings;
