import $ from 'jquery';
import { log } from '../common/logs';
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
export const iframeClassName = 'nekoimage_iframe';
const iframeMaxWidth = 700;
const iframeMaxHeight = 650;
const vueAppMountID = 'nekoImagePluginView';
const globalCSSPath = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/style.css`;
const iframeDarkCSSPath = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/dark.css`;
const iframeCSSPath = `local:///${LiteLoader.plugins['image_search'].path.plugin}/renderer/injectIframe.css`;

const isDarkMode = () => $('body').attr('q-theme') === 'dark';

const adjustIframe = (iframe: JQuery<HTMLElement>) => {
  const appElement = $('#app').get(0);
  if (!appElement) {
    log.error("Element with id 'app' not found.");
    return;
  }
  const rect = appElement.getBoundingClientRect();
  const width = rect.width > iframeMaxWidth ? iframeMaxWidth : rect.width * 0.8;
  const height = rect.height > iframeMaxHeight ? iframeMaxHeight : rect.height * 0.8;
  const centerX = (rect.width - width) / 2;
  const centerY = (rect.height - height) / 2;
  $(iframe).css({
    position: 'absolute',
    width: `${width}px`,
    height: `${height}px`,
    left: `${centerX}px`,
    top: `${centerY}px`
  });
};

export const setupIframe = () => {
  const $iframe = $('<iframe>', {
    id: iframeID,
    src: 'about:blank',
    class: `${iframeClassName} ${iframePreShowClassName}`
  }).on('load', () => {
    const iframeElement = $iframe[0] as HTMLIFrameElement;
    const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow?.document;
    if (iframeDocument) {
      // inner css - global css
      $(iframeDocument.head).append(`<link rel="stylesheet" href="${globalCSSPath}">`);
      // inner css - Dark mode css
      // TODO: dynamic adjust even manually switch dark mode
      if (isDarkMode()) {
        $(iframeDocument.head).append(`<link rel="stylesheet" class="dark-mode-style" href="${iframeDarkCSSPath}">`);
      }
      // outer css
      $('head').append(`<link rel="stylesheet" href="${iframeCSSPath}">`);
      // inject vue app
      // start work with LiteLoaderQQNT-lite_tools since commit
      // https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools/commit/49700bdbdd4a7d17466b125f301fe34b52433b53
      $(iframeDocument.body).append(`<div id="${vueAppMountID}"></div>`);
      AppEntry('searchWindow', `#${vueAppMountID}`, iframeDocument)
        .then(() => log.debug('setupIframe: AppEntry Inject Success'))
        .catch((e) => log.debug('setupIframe: AppEntry Inject Failed', e.stack.toString()));
    } else {
      log.error('setupIframe: AppEntry Inject Cannot find iframeDocument!');
    }
  });
  // set NTQQ locate
  $('#app').append($iframe).css('position', 'relative');
  $(window).on('resize', () => adjustIframe($iframe));
  adjustIframe($iframe);
  controlIframe(iframeStyleEnum.hide, $iframe);
  // Mask setup
  $('<div>', {
    id: iframeMaskClassName,
    class: iframeMaskClassName,
    click: function () {
      hideIframe(iframeID);
      controlMask('none', $(this));
    }
  }).appendTo('body');
};
