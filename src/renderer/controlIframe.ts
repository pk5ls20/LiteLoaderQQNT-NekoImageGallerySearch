import { log } from '../common/share/logs';

export const iframeMaskClassName = 'nekoimage_mask';
export const iframePreShowClassName = 'nekoimage_iframe_pre_show';
export const iframePreHideClassName = 'nekoimage_iframe_pre_hide';

export enum iframeStyleEnum {
  show,
  hide
}

const preShow = (ele: any) => {
  ele.classList.add(iframePreShowClassName);
  ele.classList.remove(iframePreHideClassName);
};
const preHide = (ele: any) => {
  ele.classList.add(iframePreHideClassName);
  ele.classList.remove(iframePreShowClassName);
};
export const controlIframe = (style: iframeStyleEnum, iframe: any) => {
  if (style === iframeStyleEnum.show) {
    iframe.style.visibility = 'visible';
    iframe.style.display = 'block';
  } else if (style === iframeStyleEnum.hide) {
    iframe.style.visibility = 'hidden';
    iframe.style.display = 'none';
  } else {
    log.error('controlIframe: Bad style');
  }
};
export const controlMask = (style: string, mask?: any) => {
  if (mask) {
    mask.style.display = style;
  } else {
    const mask = document.getElementById(iframeMaskClassName);
    if (mask) mask.style.display = style;
  }
};
export const showIframe = (iframeID: string = '', iframe?: HTMLIFrameElement | null) => {
  const targetIframe = iframe || document.getElementById(iframeID);
  if (targetIframe) {
    controlMask('block');
    controlIframe(iframeStyleEnum.show, targetIframe);
    preShow(targetIframe);
    setTimeout(() => {
      controlIframe(iframeStyleEnum.show, targetIframe);
      preHide(targetIframe);
    }, 0);
  } else {
    log.error('showIframe: Cannot find targetIframe');
  }
};

export const hideIframe = (iframeID: string = '', iframe?: HTMLIFrameElement | null) => {
  const targetIframe = iframe || document.getElementById(iframeID);
  if (targetIframe) {
    preShow(targetIframe);
    setTimeout(() => {
      controlMask('none');
      controlIframe(iframeStyleEnum.hide, targetIframe);
    }, 400);
  } else {
    log.error('hideIframe: Cannot find targetIframe');
  }
};
