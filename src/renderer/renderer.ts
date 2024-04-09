/// <reference path="../global.d.ts" />
import {btn_observer} from './injectButton'
import {setupIframe} from "./injectIframe";
import {settings} from "./settings";

// start to load & inject iframe
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIframe);
} else {
    setupIframe();
}

// add button observer
btn_observer.observe(document.body, {childList: true, subtree: true, attributes: true});

// TODO: export single settings function
export const onSettingWindowCreated = settings;
