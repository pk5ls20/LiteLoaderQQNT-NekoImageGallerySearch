import iconHtml from '../../app/assets/logo.svg?raw';
import { imageContainer } from '../../common/imageContainer';
import { log } from '../../common/share/logs';
import { TriggerImageRegisterName } from '../../common/share/triggerImageRegisterName';
import { arkForwardMsgBytesData, forwardMsgData, picMsgData, vueMsgElement } from '../../common/NTQQMsgModel';
import { showToast } from '../common/toast';
import { ImgObject } from '../../common/imgObject';
import * as channel from '../../common/channels';

declare let app: any; // hooked NTQQ mainwindow vue app

const mouseEventName: 'mouseup' | 'mousedown' = LiteLoader.os.platform === 'win32' ? 'mouseup' : 'mousedown';

// reference https://github.com/xh321/LiteLoaderQQNT-QR-Decode/blob/master/src/qContextMenu.js#L12
const addQContextMenu = (
  qContextMenu: Element,
  icon: string,
  title: string,
  menuID: string,
  callback: () => Promise<void>
) => {
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

const injectLogic = async (msgData: forwardMsgData) => {
  (async () => {
    const ps = await window.imageSearch.downloadMsgContent<forwardMsgData, ImgObject, picMsgData, ImgObject>(
      msgData,
      channel.GET_FORWARD_MSG_PIC,
      channel.DOWNLOAD_MULTI_MSG_IMAGE
    );
    const startDownloadResult = await ps.startDownload;
    await window.imageSearch.addUploadFileReq(startDownloadResult.onDiskMsgContentList);
    showToast(
      `Successfully retrieved 
              ${startDownloadResult.onDiskMsgContentList.length + startDownloadResult.notOnDiskMsgContentList.length} 
              forwardMsg content! Starting background download ${startDownloadResult.notOnDiskMsgContentList.length} images...`,
      5000
    );
    const es = await ps.endDownload;
    // log.debug('Downloaded ForwardMsg images:', es);
    await window.imageSearch.addUploadFileReq(es);
    const message =
      startDownloadResult.notOnDiskMsgContentList.length > 0
        ? `Successfully downloaded ${startDownloadResult.notOnDiskMsgContentList.length} images! `
        : '';
    showToast(`${message}Open NekoImage to upload...`, 5000);
  })().catch((error) => {
    log.debug('Error when downloading ForwardMsg images:', error);
    showToast(`Error when downloading ForwardMsg images: ${error}`, 5000, 'error');
  });
};

const isArkElementLikeForwardMsg = (bytesData: string): boolean => {
  try {
    const arkBytesData: arkForwardMsgBytesData = JSON.parse(bytesData);
    return arkBytesData?.app === 'com.tencent.multimsg';
  } catch (error) {
    return false;
  }
};

export const addQContextMenuMain = async () => {
  let imageObject: imageContainer | null = null;
  let forwardMsgData: forwardMsgData | null = null;
  let el: HTMLElement | null = null;
  let isRightClick = false;
  const bodyElement = document.querySelector('body');
  const haveImgContent = (): boolean => {
    return el !== null && el.classList.contains('image-content') && !!el.getAttribute('src');
  };
  if (bodyElement === null) {
    log.error('addQContextMenuMain: Cannot find bodyElement, inject addQContextMenuMain failed');
    return;
  }
  document.addEventListener(mouseEventName, async (event: MouseEvent) => {
    isRightClick = false;
    if (event.button === 2) {
      forwardMsgData = null;
      imageObject = null;
      isRightClick = true;
      if (event.target instanceof HTMLElement) {
        el = event.target;
        const elParent = el.closest('.ml-item');
        if (!elParent) return;
        // hook vue app to get forward msg data
        const forwardMsgVueElement = app?.__vue_app__?.config?.globalProperties?.$store?.state?.aio_chatMsgArea
          ?.msgListRef?.curMsgs as vueMsgElement[] | null;
        const forwardMsgElement = forwardMsgVueElement?.find((msg: vueMsgElement) => msg.id === elParent.id);
        // log.debug('Forward Msg Element', forwardMsgElement);
        // In QQ, forward msg elements cannot be combined like text and picture messages, so just simply use elements[0]
        // common forward msg, just multiForwardMsgElement
        if (forwardMsgElement?.data?.elements[0]?.multiForwardMsgElement) {
          forwardMsgData = {
            peerUid: forwardMsgElement?.data?.peerUid,
            chatType: forwardMsgElement?.data?.chatType,
            rootMsgId: forwardMsgElement?.data?.msgId,
            parentMsgId: forwardMsgElement?.data?.msgId,
            resId: forwardMsgElement?.data?.elements[0]?.multiForwardMsgElement?.resId
          };
        }
        // unusual forward msg, special arkElement
        else if (
          forwardMsgElement?.data?.elements[0]?.arkElement &&
          isArkElementLikeForwardMsg(forwardMsgElement?.data?.elements[0]?.arkElement?.bytesData)
        ) {
          const bd = JSON.parse(forwardMsgElement?.data?.elements[0]?.arkElement?.bytesData) as arkForwardMsgBytesData;
          forwardMsgData = {
            peerUid: forwardMsgElement?.data?.peerUid,
            chatType: forwardMsgElement?.data?.chatType,
            rootMsgId: forwardMsgElement?.data?.msgId,
            parentMsgId: forwardMsgElement?.data?.msgId,
            resId: bd?.meta?.detail?.resid
          };
        }
        if (forwardMsgData) log.debug('Got Forward Message', JSON.stringify(forwardMsgData));
      }
      if (event.target instanceof HTMLImageElement) {
        if (haveImgContent()) {
          imageObject = new imageContainer(event.target.src?.toString());
          log.debug(
            'Got Image',
            imageObject.src.length > 200 ? `${imageObject.src.slice(0, 200)}...` : imageObject.src
          );
        }
      }
    }
  });
  new MutationObserver(async () => {
    const qContextMenu = document.querySelector('.q-context-menu');
    if (qContextMenu && isRightClick) {
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
          if (forwardMsgData) await injectLogic(forwardMsgData);
        });
      }
    }
  }).observe(bodyElement, { childList: true });
};
