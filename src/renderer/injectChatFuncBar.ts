import iconHtml from '../assets/logo.svg?raw';
import {setupIframe, iframeID} from "./injectIframe";
import {showIframe} from "./controlIframe"

export const injectChatFuncBarObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            const nodes = Array.from(mutation.addedNodes);
            nodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node["classList"].contains('chat-func-bar')) {
                    // inject iframe only once
                    if (document.getElementById(iframeID) === null) {
                        setupIframe();
                    }
                    // inject button
                    const funcBar = (node as Element).getElementsByTagName('div')[0];
                    const openButton = funcBar.lastElementChild.cloneNode(true);
                    const icon = (openButton as Element).getElementsByTagName('i')[0];
                    icon.innerHTML = iconHtml;
                    openButton.addEventListener('click', () => {
                        showIframe(iframeID)
                    });
                    funcBar.appendChild(openButton);
                }
            });
        }
    });
});