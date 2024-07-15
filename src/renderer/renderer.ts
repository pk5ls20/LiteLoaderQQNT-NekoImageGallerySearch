/// <reference path="../global.d.ts" />
import { injectChatFuncBar } from './injectChatFuncBar';
import { addQContextMenuMain } from './injectRightMenu';
import { settings } from './settings';
import { injectMultipleSelection } from './injectMultipleSelection';

// First, add ChatFuncBar observer, iframe and button will inject here
await injectChatFuncBar();
// Then, observe and trigger action
injectMultipleSelection();
// Then, inject right menu
await addQContextMenuMain();
// TODO: export single settings function
export const onSettingWindowCreated = settings;
