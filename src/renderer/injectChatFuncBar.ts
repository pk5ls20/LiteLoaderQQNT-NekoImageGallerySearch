import iconHtml from '../app/assets/logo.svg?raw';
import { setupIframe, iframeID } from './injectIframe';
import { showIframe } from './controlIframe';

// reference https://github.com/xtaw/LiteLoaderQQNT-Fake-Message/blob/master/src/renderer.js#L72
export const injectChatFuncBarObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.classList.contains('chat-func-bar')) {
          // inject iframe only once
          if (document.getElementById(iframeID) === null) {
            setupIframe();
          }
          const funcBar = element.getElementsByTagName('div')[0];
          if (funcBar) {
            const lastElementChild = funcBar.lastElementChild;
            if (lastElementChild) {
              const openButton = lastElementChild.cloneNode(true) as Element;
              const icon = openButton.getElementsByTagName('i')[0];
              icon.innerHTML = iconHtml;
              openButton.addEventListener('click', () => {
                showIframe(iframeID);
              });
              funcBar.appendChild(openButton);
            }
          }
        }
      }
    }
  });
});
