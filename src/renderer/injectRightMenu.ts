import iconHtml from '../app/assets/logo.svg?raw';
import { imageContainer } from '../common/imageContainer';
import { log } from '../common/share/logs';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { vueMsgElement, forwardMsgData } from './NTQQMsgModel';
import { showToast } from './toast';

declare var app: any; // hooked NTQQ mainwindow vue app

let mouseEventName: 'mouseup' | 'mousedown' = LiteLoader.os.platform === 'win32' ? 'mouseup' : 'mousedown';

// reference https://github.com/xh321/LiteLoaderQQNT-QR-Decode/blob/master/src/qContextMenu.js#L12
const addQContextMenu = (qContextMenu: Element, icon: string, title: string, menuID: string, callback: Function) => {
  if (qContextMenu.querySelector(`#${menuID}`) != null) {
    log.debug(`addQContextMenu: ${menuID} already exists.`);
    return;
  }
  const tempEl = document.createElement('div');
  const selectorFirst = 'a.q-context-menu-item--normal:not([disabled="true"])'; // priority find normal menu item
  const selectorSecond = '.q-context-menu :not([disabled="true"])'; // rollback to find any menu item
  const menuItem = document.querySelector(selectorFirst) || document.querySelector(selectorSecond);
  if (menuItem) {
    tempEl.innerHTML = menuItem.outerHTML.replace(/<!---->/g, '');
  } else {
    log.error('addQContextMenu: No enabled menu item found.');
    tempEl.innerHTML = '';
  }
  const item: HTMLElement = tempEl.firstChild as HTMLElement;
  item.id = menuID;
  const iconElement = item.querySelector('.q-icon');
  if (iconElement) {
    (iconElement as HTMLElement).innerHTML = icon;
  }
  if (item.classList.contains('q-context-menu-item__text')) {
    item.innerText = title;
  } else {
    const textElement = item.querySelector('.q-context-menu-item__text');
    if (textElement) {
      (textElement as HTMLElement).innerText = title;
    }
  }
  item.addEventListener('click', async () => {
    await callback();
    qContextMenu.remove();
  });
  const separator = qContextMenu.querySelector('.q-context-menu-separator');
  separator === null ? qContextMenu.appendChild(item) : qContextMenu.insertBefore(item, separator);
};

export const addQContextMenuMain = async () => {
  let imageObject: imageContainer | null = null;
  let forwardMsgData: forwardMsgData | null = null;
  let el: HTMLElement | null = null;
  const bodyElement = document.querySelector('body');
  const haveImgContent = (): boolean => {
    return el !== null && el.classList.contains('image-content') && !!el.getAttribute('src');
  };
  if (bodyElement === null) {
    log.error('addQContextMenuMain: Cannot find bodyElement, inject addQContextMenuMain failed');
    return;
  }
  document.addEventListener(mouseEventName, async (event: MouseEvent) => {
    if (event.button === 2) {
      if (event.target instanceof HTMLElement) {
        el = event.target as HTMLElement;
        const elParent = el.closest('.ml-item');
        if (!elParent) return;
        // hook vue app to get forward msg data
        const forwardMsgVueElement = (app as any)?.__vue_app__?.config?.globalProperties?.$store?.state?.aio_chatMsgArea
          ?.msgListRef?.curMsgs as vueMsgElement[] | null;
        const forwardMsgElement = forwardMsgVueElement?.find((msg: vueMsgElement) => msg.id === elParent.id);
        // In QQ, forward msg elements cannot be combined like text and picture messages, so just simply use elements[0]
        if (forwardMsgElement?.data?.elements[0]?.multiForwardMsgElement) {
          forwardMsgData = {
            peerUid: forwardMsgElement?.data?.peerUid,
            chatType: forwardMsgElement?.data?.chatType,
            msgId: forwardMsgElement?.data?.msgId,
            resId: forwardMsgElement?.data?.elements[0]?.multiForwardMsgElement?.resId
          };
          // log.debug('Got Forward Message', JSON.stringify(forwardMsgData));
        } else {
          forwardMsgData = null;
        }
      }
      if (event.target instanceof HTMLImageElement) {
        if (haveImgContent()) {
          imageObject = new imageContainer((event.target as HTMLImageElement).src?.toString());
          // log.debug('Got Image', JSON.stringify(imageObject));
        } else {
          imageObject = null;
        }
      }
    }
  });
  new MutationObserver(async () => {
    const qContextMenu = document.querySelector('.q-context-menu');
    if (qContextMenu) {
      if (imageObject) {
        const fileBlobContent = await imageObject.toBlob();
        addQContextMenu(qContextMenu, iconHtml, 'Image Search', 'nekoimg-i2i-menu', async () => {
          log.debug('Image Search');
          window.imageSearch.postAppImageReq(fileBlobContent, TriggerImageRegisterName.IMAGE_SEARCH);
        });
        addQContextMenu(qContextMenu, iconHtml, 'Image Upload', 'nekoimg-upload-menu', async () => {
          log.debug('Image Upload');
          window.imageSearch.postAppImageReq(fileBlobContent, TriggerImageRegisterName.IMAGE_UPLOAD);
        });
      }
      if (forwardMsgData) {
        addQContextMenu(qContextMenu, iconHtml, 'Upload forwardMsg images', 'nekoimg-forward-msg-menu', async () => {
          await window.imageSearch.getForwardMsgContent(forwardMsgData!);
          // TODO:
          showToast('Not Implemented...', 5000);
        });
      }
    }
  }).observe(bodyElement, { childList: true });
};
