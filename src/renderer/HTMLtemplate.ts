// reference https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools/blob/v4/src/render_modules/HTMLtemplate.js
const toastContentEl = `<div class="q-toast nekoimage-toast" style="position: fixed; z-index: 5000; top: 0px; left: 0px; pointer-events: none"></div>`;

const toastEl = `<div class="nekoimage-toast-item"><div class="q-toast-item">{{icon}}<span>{{content}}</span></div></div>`;

const defaultIcon = `<i style="width:20px;height:20px; color:#0099ff;"><svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM8.5 6.5V11.5H7.5V6.5H8.5ZM8.5 5.5V4.5H7.5V5.5H8.5Z"></path>
</svg></i>`;

const successIcon = `<i style="width:20px;height:20px; color:#15D173;"><svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5ZM7.45232 10.2991L11.3555 6.35155L10.6445 5.64845L7.08919 9.2441L5.22771 7.44087L4.53193 8.15913L6.74888 10.3067L7.10435 10.651L7.45232 10.2991Z"></path>
</svg></i>`;

const errorIcon = `<i style="width:20px;height:20px; color:#FF5967;"><svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM8.5 4.5V9.5H7.5V4.5H8.5ZM8.5 11.5V10.5H7.5V11.5H8.5Z"></path>
</svg></i>`;

const toastCSSContent = `
    @keyframes slideInDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes slideOutUp {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
    .nekoimage-toast-show {
      animation: slideInDown 0.5s forwards;
    }
    .nekoimage-toast-hide {
      animation: slideOutUp 0.5s forwards;
    }
  `;

export { toastContentEl, toastEl, defaultIcon, successIcon, errorIcon, toastCSSContent };
