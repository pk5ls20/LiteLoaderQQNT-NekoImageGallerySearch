import {log} from "../logs";
import AppEntry from "../app/appEntry";

const iframeMaxWidth = 700;
const iframeMaxHeight = 650;
const mountID = 'nekoImagePluginView'
const iframeID = 'nekoImagePluginIframe'
const iframeClassName = 'nekoimage_iframe'
const iframePreShowClassName = 'nekoimage_iframe_pre_show'
const iframePreHideClassName = 'nekoimage_iframe_pre_hide'
const iframeMaskClassName = 'nekoimage_mask'
const preShow = (ele: any) => {
    ele.classList.add(iframePreShowClassName)
    ele.classList.remove(iframePreHideClassName)
}
const preHide = (ele: any) => {
    ele.classList.add(iframePreHideClassName)
    ele.classList.remove(iframePreShowClassName)
}
enum iframeStyleEnum {
    show, hide
}
const controlIframe = (style: iframeStyleEnum, iframe: any) => {
    if (style === iframeStyleEnum.show) {
        iframe.style.visibility = 'visible';
        iframe.style.display = 'block';
    } else if (style === iframeStyleEnum.hide) {
        iframe.style.visibility = 'hidden';
        iframe.style.display = 'none';
    } else {
        log("Bad style")
    }
}
const controlMask = (style: string, mask?: any) => {
    if (mask) {
        mask.style.display = style
    } else {
        const mask = document.getElementById(iframeMaskClassName);
        if (mask) mask.style.display = style;
    }
}
const isDarkMode = document.body.getAttribute('q-theme') == 'dark';

const adjustIframe = (iframe: any) => {
    const appDiv = document.getElementById('app');
    if (!appDiv) {
        log("Div with id 'app' not found.");
        return;
    }
    const rect = appDiv.getBoundingClientRect();
    const width = rect.width > iframeMaxWidth ? iframeMaxWidth : rect.width * 0.8
    const height = rect.height > iframeMaxHeight ? iframeMaxHeight : rect.height * 0.8
    const centerX = (rect.width - width) / 2;
    const centerY = (rect.height - height) / 2;
    iframe.style.position = 'absolute';
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.left = `${centerX}px`;
    iframe.style.top = `${centerY}px`;
}

export const setupIframe = () => {
    const iframe = document.createElement('iframe');
    iframe.id = iframeID;
    log(document.body.getAttribute('q-theme') == 'dark')
    iframe.onload = () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        // inner css - global css
        const innerGlobalCSSLink = document.createElement('link');
        innerGlobalCSSLink.rel = 'stylesheet';
        innerGlobalCSSLink.href = `local:///${LiteLoader.plugins["image_search"].path.plugin}/renderer/style.css`;
        iframeDocument.head.appendChild(innerGlobalCSSLink);
        // inner css - Dark mode css
        // TODO: dynamic adjust even manually switch dark mode
        if (isDarkMode) {
            log("DarkMode detected")
            const innerDarkCSSLink = document.createElement('link');
            innerDarkCSSLink.rel = 'stylesheet';
            innerDarkCSSLink.href = `local:///${LiteLoader.plugins["image_search"].path.plugin}/renderer/dark.css`;
            iframeDocument.head.appendChild(innerDarkCSSLink);
        } else {
            log("DarkMode isn't detected")
        }
        // outer css
        const outerCSSLink = document.createElement('link');
        outerCSSLink.rel = 'stylesheet';
        outerCSSLink.href = `local:///${LiteLoader.plugins["image_search"].path.plugin}/renderer/injectIframe.css`;
        document.head.appendChild(outerCSSLink);
        // inject vue app
        const mountPoint = iframeDocument.createElement('div');
        mountPoint.id = mountID;
        iframeDocument.body.appendChild(mountPoint);
        AppEntry('searchWindow', `#${mountID}`, iframeDocument)
            .then(r => console.log("AppEntry Success", r))
            .catch(e => console.log("AppEntry Failed", e));
    };
    iframe.src = 'about:blank';
    // set QQNT locate
    const appDiv = document.getElementById('app');
    if (appDiv) {
        appDiv.appendChild(iframe);
        appDiv.style.position = 'relative';
        // dynamic adjust iframe's size
        adjustIframe(iframe);
        window.addEventListener('resize', () => adjustIframe(iframe));
    } else {
        console.error("Div with id 'app' not found.");
    }
    // add special injectIframe.css
    iframe.classList.add(iframeClassName);
    iframe.classList.add(iframePreShowClassName)
    controlIframe(iframeStyleEnum.hide, iframe);
    // add mask on QQNT
    const mask = document.createElement('div');
    mask.id = iframeMaskClassName;
    mask.classList.add(iframeMaskClassName)
    document.body.appendChild(mask);
    mask.addEventListener('click', function () {
        hideIframe(iframe);
        controlMask('none', mask)
    });
}


export const showIframe = (iframe: HTMLIFrameElement | null) => {
    const targetIframe = iframe || document.getElementById(iframeID);
    if (targetIframe) {
        controlMask('block')
        controlIframe(iframeStyleEnum.show, targetIframe);
        preShow(targetIframe);
        setTimeout(() => {
            controlIframe(iframeStyleEnum.show, targetIframe);
            preHide(targetIframe);
        }, 0);
    }
};

export const hideIframe = (iframe: HTMLIFrameElement | null) => {
    const targetIframe = iframe || document.getElementById(iframeID);
    if (targetIframe) {
        preShow(targetIframe);
        setTimeout(() => {
            controlIframe(iframeStyleEnum.hide, targetIframe);
            controlMask('none')
        }, 400);
    }
};