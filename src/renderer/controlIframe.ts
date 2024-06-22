import $ from 'jquery';
import { log } from '../common/logs';

export const iframeMaskClassName = 'nekoimage_mask';
export const iframePreShowClassName = 'nekoimage_iframe_pre_show';
export const iframePreHideClassName = 'nekoimage_iframe_pre_hide';

export enum iframeStyleEnum {
  show,
  hide
}

const preShow = (ele: JQuery<HTMLElement>) => {
  ele.addClass(iframePreShowClassName).removeClass(iframePreHideClassName);
};

const preHide = (ele: JQuery<HTMLElement>) => {
  ele.addClass(iframePreHideClassName).removeClass(iframePreShowClassName);
};

export const controlIframe = (style: iframeStyleEnum, iframe: JQuery<HTMLElement>) => {
  if (style === iframeStyleEnum.show) {
    iframe.css({
      visibility: 'visible',
      display: 'block'
    });
  } else if (style === iframeStyleEnum.hide) {
    iframe.css({
      visibility: 'hidden',
      display: 'none'
    });
  } else {
    log.error('controlIframe: Bad style');
  }
};

export const controlMask = (style: string, mask?: JQuery<HTMLElement>) => {
  if (!mask) {
    mask = $(`.${iframeMaskClassName}`);
  }
  mask.css('display', style);
};

export const showIframe = (iframeID: string = '', iframe?: JQuery<HTMLElement>) => {
  const targetIframe = iframe || $(`#${iframeID}`);
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

export const hideIframe = (iframeID: string = '', iframe?: JQuery<HTMLElement>) => {
  const targetIframe = iframe || $(`#${iframeID}`);
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
