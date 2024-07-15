import iconHtml from '../../app/assets/logo.svg?raw';
import { iframeID } from '../iframe/injectIframe';
import { log } from '../../common/share/logs';

// reference https://github.com/xtaw/LiteLoaderQQNT-Fake-Message/blob/master/src/renderer.js#L72
export const injectChatFuncBar = async (clickCB: Promise<void>, settingUpdateCB: () => Promise<void>) => {
  new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.classList.contains('chat-func-bar')) {
            // inject iframe only once
            if (document.getElementById(iframeID) === null) {
              log.debug('injectChatFuncBarObserver: iframe not exists, prepare to inject');
              await clickCB;
            } else {
              log.debug('injectChatFuncBarObserver: iframe already exists');
            }
            const funcBar = element.getElementsByTagName('div')[0];
            if (funcBar) {
              const lastElementChild = funcBar.lastElementChild;
              if (lastElementChild) {
                const openButton = lastElementChild.cloneNode(true) as Element;
                // 查找并修改特定的嵌套 <div> 元素
                const iconItem = openButton.querySelector('div.icon-item');
                if (iconItem) {
                  iconItem.id = 'id-func-bar-neko-image';
                  iconItem.setAttribute('aria-label', 'NekoImage');
                }
                const icon = openButton.getElementsByTagName('i')[0];
                icon.innerHTML = iconHtml;
                openButton.addEventListener('click', settingUpdateCB);
                funcBar.appendChild(openButton);
              }
            }
          }
        }
      }
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
};
