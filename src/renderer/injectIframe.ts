import { log } from '../logs';
import AppEntry from '../app/appEntry';
import {
  controlIframe,
  controlMask,
  hideIframe,
  iframeMaskClassName,
  iframePreShowClassName,
  iframeStyleEnum
} from './controlIframe';

export const iframeID = 'nekoImagePluginIframe';
const iframeMaxWidth = 700;
const iframeMaxHeight = 650;
const mountID = 'nekoImagePluginView';
const iframeClassName = 'nekoimage_iframe';
const isDarkMode = () => document.body.getAttribute('q-theme') === 'dark';
const adjustIframe = (iframe: any) => {
  const appDiv = document.getElementById('app');
  if (!appDiv) {
    log.error("adjustIframe: Div with id 'app' not found.");
    return;
  }
  const rect = appDiv.getBoundingClientRect();
  const width = rect.width > iframeMaxWidth ? iframeMaxWidth : rect.width * 0.8;
  const height = rect.height > iframeMaxHeight ? iframeMaxHeight : rect.height * 0.8;
  const centerX = (rect.width - width) / 2;
  const centerY = (rect.height - height) / 2;
  iframe.style.position = 'absolute';
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.left = `${centerX}px`;
  iframe.style.top = `${centerY}px`;
};

export const setupIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.id = iframeID;
  iframe.onload = () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument !== undefined) {
      // inner css - global css
      const innerGlobalCSSLink = document.createElement('link');
      innerGlobalCSSLink.rel = 'stylesheet';
      innerGlobalCSSLink.href = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/style.css`;
      iframeDocument.head.appendChild(innerGlobalCSSLink);
      // inner css - Dark mode css
      // TODO: dynamic adjust even manually switch dark mode
      if (isDarkMode()) {
        log.debug('setupIframe: DarkMode is detected');
        const innerDarkCSSLink = document.createElement('link');
        innerDarkCSSLink.rel = 'stylesheet';
        innerDarkCSSLink.className = 'dark-mode-style';
        innerDarkCSSLink.href = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/dark.css`;
        iframeDocument.head.appendChild(innerDarkCSSLink);
      } else {
        log.debug('setupIframe: DarkMode is not detected');
      }
      // outer css
      const outerCSSLink = document.createElement('link');
      outerCSSLink.rel = 'stylesheet';
      outerCSSLink.href = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/injectIframe.css`;
      document.head.appendChild(outerCSSLink);
      // inject vue app
      // start work with LiteLoaderQQNT-lite_tools since commit
      // https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools/commit/49700bdbdd4a7d17466b125f301fe34b52433b53
      const mountPoint = iframeDocument.createElement('div');
      mountPoint.id = mountID;
      iframeDocument.body.appendChild(mountPoint);
      AppEntry('searchWindow', `#${mountID}`, iframeDocument)
        .then(() => log.debug('setupIframe: AppEntry Inject Success'))
        .catch((e) => log.debug('setupIframe: AppEntry Inject Failed', e.stack.toString()));
    } else {
      log.debug('setupIframe: AppEntry Inject Cannot find iframeDocument!');
    }
  };
  iframe.src = 'about:blank';
  // set QQNT locate
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.appendChild(iframe);
    appDiv.style.position = 'relative';
    // dynamic adjust iframe's size
    adjustIframe(iframe);
    window.addEventListener('resize', () => adjustIframe(iframe));
  } else {
    log.error("appDiv: Div with id 'app' not found.");
  }
  // add special injectIframe.css
  iframe.classList.add(iframeClassName);
  iframe.classList.add(iframePreShowClassName);
  controlIframe(iframeStyleEnum.hide, iframe);
  // add mask on QQNT
  const mask = document.createElement('div');
  mask.id = iframeMaskClassName;
  mask.classList.add(iframeMaskClassName);
  document.body.appendChild(mask);
  mask.addEventListener('click', function () {
    hideIframe(iframeID);
    controlMask('none', mask);
  });
};
