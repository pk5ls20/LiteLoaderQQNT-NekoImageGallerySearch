import $ from 'jquery';
import iconHtml from '../app/assets/logo.svg?raw';
import { setupIframe, iframeID } from './injectIframe';
import { showIframe } from './controlIframe';
import { log } from '../common/logs';

export const nekoImageIconID = 'id-func-bar-neko-image';
export const nekoImageIconAriaLabel = 'NekoImage';

// reference https://github.com/xtaw/LiteLoaderQQNT-Fake-Message/blob/master/src/renderer.js#L72
export const injectChatFuncBarObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    $(mutation.addedNodes)
      .filter((index, node) => $(node).hasClass('chat-func-bar'))
      .each(function () {
        // inject iframe only once
        if ($(`#${iframeID}`).length) {
          log.debug('injectChatFuncBarObserver: iframe already exists');
        } else {
          log.debug('injectChatFuncBarObserver: iframe not exists, prepare to inject');
          setupIframe();
        }
        let funcBar = $(this).find('div:first');
        if (funcBar.length) {
          let lastElementChild = funcBar.children(':last');
          if (lastElementChild.length) {
            let openButton = lastElementChild.clone(true);
            // 查找并修改特定的嵌套 <div> 元素
            let iconItem = openButton.find('div.icon-item');
            if (iconItem.length) {
              iconItem.attr('id', nekoImageIconID).attr('aria-label', nekoImageIconAriaLabel);
            }
            openButton.find('i:first').html(iconHtml);
            openButton.on('click', async function () {
              window.imageSearch.triggerSettingReq(null);
              showIframe(iframeID);
            });
            funcBar.append(openButton);
          } else {
            log.error('injectChatFuncBarObserver: Cannot find lastElementChild');
          }
        } else {
          log.error('injectChatFuncBarObserver: Cannot find chat-func-bar');
        }
      });
  });
});
