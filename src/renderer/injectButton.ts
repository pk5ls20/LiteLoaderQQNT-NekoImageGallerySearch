import {log} from "../logs";
import iconHtml from '../assets/logo.svg?raw';
import {showIframe} from "./injectIframe";

export const btn_observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            const nodes = Array.from(mutation.addedNodes);
            nodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node["classList"].contains('chat-func-bar')) {
                    const funcBar = (node as Element).getElementsByTagName('div')[0];
                    const openButton = funcBar.lastElementChild.cloneNode(true);
                    const icon = (openButton as Element).getElementsByTagName('i')[0];
                    icon.innerHTML = iconHtml;
                    const nekoImageWindow = document.getElementById('search-window');
                    const nekoImageMarkWindow = document.getElementById('search-mark-window');
                    const nekoImageDialog = document.getElementById('search-dialog');
                    log("[capture]", nekoImageWindow, nekoImageMarkWindow, nekoImageDialog);
                    openButton.addEventListener('click', () => {
                        showIframe(document.querySelector("#app > iframe"))
                    });
                    funcBar.appendChild(openButton);
                }
            });
        }
    });
});