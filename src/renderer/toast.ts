// reference https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools/blob/v4/src/render_modules/toast.js
// It seems that Vue is hooked in the lite_tools,
// so all the effects can be achieved by directly listening to (CSS) transitionend,
// but it doesn’t work here, and it needs to be slightly modified to work
import { defaultIcon, errorIcon, successIcon, toastContentEl, toastCSSContent, toastEl } from './HTMLtemplate';

interface ToastElement extends Element {
  timeout: ReturnType<typeof setTimeout>;
  close: () => void;
}

type iconType = 'success' | 'error' | 'none' | 'default';

(() => {
  const style = document.createElement('style');
  document.head.appendChild(style);
  style.textContent = toastCSSContent;
})();

const createToastContentEl = (HTMLTemplate: string): Element => {
  document.body.insertAdjacentHTML('beforeend', HTMLTemplate);
  return document.querySelector('.nekoimage-toast') as Element;
};

const toastContent = createToastContentEl(toastContentEl);

const domParser = new DOMParser();

const showToast = (content: string, duration: number, type: iconType = 'default'): ToastElement => {
  const toast = createToastEl(content, type);
  toastContent.appendChild(toast);
  toast.classList.add('nekoimage-toast-show');
  toast.close = () => {
    clearTimeout(toast.timeout);
    toast.classList.replace('nekoimage-toast-show', 'nekoimage-toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 500);
  };
  toast.timeout = setTimeout(() => {
    toast.close();
  }, duration);
  return toast;
};

const createToastEl = (content: string, type: iconType): ToastElement => {
  const newToastEl = toastEl.replace('{{content}}', content).replace('{{icon}}', getIcon(type));
  const doc = domParser.parseFromString(newToastEl, 'text/html');
  const element = doc.querySelector('.nekoimage-toast-item');
  if (!element) {
    throw new Error('Failed to create toast element');
  }
  const toastElement = element as ToastElement;
  toastElement.close = () => {};
  toastElement.timeout = setTimeout(() => {}, 0);
  return toastElement;
};

const getIcon = (type: iconType): string => {
  switch (type) {
    case 'success':
      return successIcon;
    case 'error':
      return errorIcon;
    case 'none':
      return '';
    case 'default':
    default:
      return defaultIcon;
  }
};

const clearToast = (): void => {
  document.querySelectorAll('.nekoimage-toast-item').forEach((element: Element) => {
    const toast = element as ToastElement;
    clearTimeout(toast.timeout);
    toast.remove();
  });
};

// TODO: use it in vue app send msg to NTQQ main window
export { showToast, clearToast };
