import iconHtml from '../app/assets/logo.svg?raw';
import { log } from '../common/share/logs';
import { imageContainer } from '../common/imageContainer';

const menuID = 'nekoimg-i2i-menu';

let mouseEventName: 'mouseup' | 'mousedown' = LiteLoader.os.platform === 'win32' ? 'mouseup' : 'mousedown';

// reference https://github.com/xh321/LiteLoaderQQNT-QR-Decode/blob/master/src/qContextMenu.js#L12
const addQContextMenu = (qContextMenu: Element, icon: string, title: string, callback: Function) => {
  if (qContextMenu.querySelector(`#${menuID}`) != null) return;
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
  let isRightClick: boolean = false;
  let imageObject: imageContainer | null = null;
  let imgEl: HTMLImageElement | null = null;
  const bodyElement = document.querySelector('body');
  const haveImgContent = (): boolean => {
    return imgEl !== null && imgEl.classList.contains('image-content') && !!imgEl.getAttribute('src');
  };
  if (bodyElement === null) {
    log.error('addQContextMenuMain: Cannot find bodyElement, inject addQContextMenuMain failed');
    return;
  }
  document.addEventListener(mouseEventName, (event: MouseEvent) => {
    if (event.button === 2 && event.target instanceof HTMLImageElement) {
      isRightClick = true;
      imgEl = event.target;
      if (haveImgContent()) {
        imageObject = new imageContainer(imgEl.src?.toString());
      } else {
        imgEl = null;
        imageObject = null;
      }
    } else {
      isRightClick = false;
      imageObject = null;
    }
  });
  new MutationObserver(() => {
    const qContextMenu = document.querySelector('.q-context-menu');
    if (qContextMenu && imageObject) {
      const currentImageObject = imageObject;
      addQContextMenu(qContextMenu, iconHtml, 'Image Search', async () => {
        const fileBlobContent = await currentImageObject.toBlob();
        window.imageSearch.postAppImageSearchReq(fileBlobContent);
      });
    }
  }).observe(bodyElement, { childList: true });
};
