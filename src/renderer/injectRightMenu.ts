import $ from 'jquery';
import iconHtml from '../app/assets/logo.svg?raw';
import { log } from '../common/logs';

const menuID = 'nekoimg-i2i-menu';

let mouseEventName: 'mouseup' | 'mousedown' = LiteLoader.os.platform === 'win32' ? 'mouseup' : 'mousedown';

class imageContainer {
  src: string;

  constructor(src: string) {
    this.src = src;
  }

  async toBlob(): Promise<Blob | null> {
    if (this.src.startsWith('data:')) {
      return this.convertBase64ToBlob();
    } else if (this.src.startsWith('appimg://')) {
      return await this.convertImageUrlToBlob();
    } else {
      throw new Error('Unsupported src type');
    }
  }

  convertBase64ToBlob() {
    try {
      const base64Content = this.src.split(';base64,').pop();
      const binary = atob(base64Content ?? '');
      const length = binary.length;
      const bytes = new Uint8Array(new ArrayBuffer(length));
      for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'image/png' });
    } catch (e) {
      return null;
    }
  }

  async convertImageUrlToBlob() {
    const pathContent = this.src.split('appimg://').pop();
    return await window.imageSearch.getLocalFileAsBlob(decodeURIComponent(pathContent ?? ''));
  }
}

// reference https://github.com/xh321/LiteLoaderQQNT-QR-Decode/blob/master/src/qContextMenu.js#L12
const addQContextMenu = (qContextMenu: JQuery<Element>, icon: string, title: string, callback: Function): void => {
  if (qContextMenu.find(`#${menuID}`).length) {
    log.debug('addQContextMenu: Menu item already exists.');
    return;
  }
  const selectorFirst = 'a.q-context-menu-item--normal:not([disabled="true"])'; // Priority find normal menu item
  const selectorSecond = '.q-context-menu :not([disabled="true"])'; // Rollback to find any menu item
  const menuItem = $(selectorFirst).length ? $(selectorFirst) : $(selectorSecond);
  if (!menuItem.length) {
    log.error('addQContextMenu: No enabled menu item found.');
    return;
  }
  const item = menuItem
    .clone()
    .removeAttr('id')
    .prop('outerHTML')
    .replace(/<!---->/g, '');
  const newItem = $(item).attr('id', menuID);
  const iconElement = newItem.find('.q-icon');
  if (iconElement.length) {
    iconElement.html(icon);
  }
  const textElement = newItem.find('.q-context-menu-item__text');
  if (textElement.length) {
    textElement.text(title);
  } else if (newItem.hasClass('q-context-menu-item__text')) {
    newItem.text(title);
  }
  newItem.on('click', async () => {
    await callback();
    qContextMenu.remove();
  });
  const separator = qContextMenu.find('.q-context-menu-separator');
  if (separator.length) {
    separator.before(newItem);
  } else {
    qContextMenu.append(newItem);
  }
};

export const addQContextMenuMain = async () => {
  let isRightClick: boolean = false;
  let imageObject: imageContainer | null = null;
  let imgEl: HTMLImageElement | null = null;
  const bodyElement = $('body');
  const haveImgContent = (): boolean => {
    return imgEl !== null && $(imgEl).hasClass('image-content') && !!$(imgEl).attr('src');
  };
  if (bodyElement.length === 0) {
    console.error('addQContextMenuMain: Cannot find bodyElement, inject addQContextMenuMain failed');
    return;
  }
  $(document).on(mouseEventName, (mouseEvent: JQuery.TriggeredEvent) => {
    if (mouseEvent.button === 2 && $(mouseEvent.target).is('img')) {
      isRightClick = true;
      imgEl = mouseEvent.target as HTMLImageElement;
      if (haveImgContent()) {
        imageObject = new imageContainer(imgEl.src?.toString());
      } else {
        imgEl = null;
        imageObject = null;
      }
    } else {
      isRightClick = false;
      imgEl = null;
      imageObject = null;
    }
  });
  new MutationObserver(() => {
    const qContextMenu = $('div.q-context-menu');
    if (qContextMenu && imageObject) {
      const currentImageObject = imageObject;
      addQContextMenu(qContextMenu, iconHtml, 'Image Search', async () => {
        const fileBlobContent = await currentImageObject.toBlob();
        window.imageSearch.postAppImageSearchReq(fileBlobContent);
      });
    }
  }).observe(bodyElement[0], { childList: true });
};
