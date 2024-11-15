import iconHtml from '../../app/assets/logo.svg?raw';
import { log } from '../../common/share/logs';
import {
  marketFaceMsgData,
  NTQQVueMarketFaceElement,
  PicElement,
  picMsgData,
  vueMsgElementData
} from '../../common/NTQQMsgModel';
import { showToast } from '../common/toast';
import * as channel from '../../common/channels';
import { ImgObject } from '../../common/imgObject';

declare let app: any; // hooked NTQQ mainwindow vue app

const addMsButton = (
  qContextMenu: Element,
  icon: string,
  title: string,
  menuID: string,
  insertPos: number,
  callback: Function
) => {
  if (qContextMenu.querySelector(`#${menuID}`) != null) {
    log.debug(`addMsButton: ${menuID} already exists.`);
    return;
  }
  const liElements = qContextMenu.querySelectorAll('li');
  const newLi = liElements[0].cloneNode(true) as HTMLElement;
  const svgContainer = newLi.querySelector('svg');
  if (svgContainer) {
    svgContainer.innerHTML = icon;
  }
  const divElement = newLi.querySelector('div');
  if (divElement) {
    divElement.textContent = title;
  }
  newLi.id = menuID;
  newLi.addEventListener('click', () => callback());
  const secondLastLi = liElements[insertPos];
  qContextMenu.insertBefore(newLi, secondLastLi);
};

const injectLogic = async () => {
  const a = app?.__vue_app__?.config?.globalProperties?.$store?.getters?.['aio_chatMessage/pickedMsgRecords'] as
    | vueMsgElementData[]
    | null;
  // log.debug('have pickedMsgRecords', a);
  const imgList: (picMsgData | marketFaceMsgData)[] = (a ?? [])
    .flatMap((msg: vueMsgElementData): (picMsgData | marketFaceMsgData | undefined)[] => {
      return (
        msg.elements?.map((element) => {
          if (element.picElement) {
            return {
              pic: {
                sourcePath: element.picElement.sourcePath
              } as PicElement,
              msgId: msg.msgId,
              chatType: msg.chatType,
              peerUid: msg.peerUid,
              elementId: element.elementId
            } as picMsgData;
          } else if (element.marketFaceElement) {
            return {
              marketFace: {
                emojiPackageId: element.marketFaceElement.emojiPackageId,
                faceName: element.marketFaceElement.faceName,
                emojiId: element.marketFaceElement.emojiId,
                key: element.marketFaceElement.key,
                staticFacePath: (element.marketFaceElement as NTQQVueMarketFaceElement).staticFacePath
              }
            } as marketFaceMsgData;
          }
        }) ?? []
      );
    })
    .filter((item): item is picMsgData | marketFaceMsgData => item !== undefined);
  // log.debug('have img list', imgList);
  (async () => {
    const ps = await window.imageSearch.downloadMsgContent<
      (picMsgData | marketFaceMsgData)[],
      ImgObject,
      picMsgData | marketFaceMsgData,
      ImgObject
    >(imgList, channel.GET_MSG_MULTI_PIC, channel.DOWNLOAD_MULTI_MSG_IMAGE);
    const startDownloadResult = await ps.startDownload;
    await window.imageSearch.addUploadFileReq(startDownloadResult.onDiskMsgContentList);
    showToast(
      `Successfully retrieved 
              ${startDownloadResult.onDiskMsgContentList.length + startDownloadResult.notOnDiskMsgContentList.length} 
              picture(s)! Starting background download ${startDownloadResult.notOnDiskMsgContentList.length} images...`,
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
  })().catch((e) => {
    log.error('Error when downloading multi images: ', e);
    showToast(`Error when downloading multi images: ${e}`, 5000, 'error');
  });
};

export const injectMultipleSelection = (): void => {
  const targetSelector: string = '.forward-ops.forward-ops-show-more';
  const injectButton = (element: HTMLElement): void => {
    if (element.style.display !== 'none') {
      addMsButton(element, iconHtml, '批量上传', 'neko-multi-upload-btn', 3, async (): Promise<void> => {
        // TODO: aria-disabled="true"
        await injectLogic();
      });
    }
  };
  const observerCallback = (mutations: MutationRecord[]): void => {
    mutations.forEach((mutation: MutationRecord) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        if ((mutation.target as Element).matches(targetSelector)) {
          injectButton(mutation.target as HTMLElement);
        }
      }
    });
  };
  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  });
};
