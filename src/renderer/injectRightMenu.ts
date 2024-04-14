import iconHtml from '../assets/logo.svg?raw';

const menuID = "nekoimg-i2i-menu"

const addQContextMenu = (qContextMenu: Element, icon: string, title: string, callback: Function) => {
    if (qContextMenu.querySelector(`#${menuID}`) != null) return;
    const tempEl = document.createElement("div");
    tempEl.innerHTML = document
        .querySelector(`.q-context-menu :not([disabled="true"])`)
        .outerHTML.replace(/<!---->/g, "");
    const item: HTMLElement = tempEl.firstChild as HTMLElement;
    item.id = menuID;
    const iconElement = item.querySelector(".q-icon");
    if (iconElement) {
        (iconElement as HTMLElement).innerHTML = icon;
    }
    if (item.classList.contains("q-context-menu-item__text")) {
        item.innerText = title;
    } else {
        const textElement = item.querySelector(".q-context-menu-item__text");
        if (textElement) {
            (textElement as HTMLElement).innerText = title;
        }
    }
    item.addEventListener("click", () => {
        callback();
        qContextMenu.remove();
    });
    qContextMenu.appendChild(item);
}

export const addQContextMenuMain = async () => {
    let isRightClick = false;
    let imagePath = "";
    let imgEl = null;
    const haveImgContent = () => imgEl.classList.contains("image-content") && imgEl?.src?.startsWith("appimg://")
    document.addEventListener("mouseup", (event) => {
        if (event.button === 2) {
            isRightClick = true;
            imgEl = event.target;
            if (haveImgContent()) {
                imagePath = imgEl?.src?.replace("appimg://", "");
            } else {
                imgEl = null;
                imagePath = "";
            }
        } else {
            isRightClick = false;
            imagePath = "";
        }
    });
    new MutationObserver(() => {
        const qContextMenu = document.querySelector(".q-context-menu");
        if (qContextMenu && imagePath) {
            let localPath = decodeURIComponent(imagePath);
            addQContextMenu(
                qContextMenu,
                iconHtml,
                "Image Search",
                async () => {
                    let picBlob = await window.imageSearch.getLocalFileAsBlob(localPath);
                    window.imageSearch.postAppImageSearchReq(picBlob);
                }
            );
        }
    }).observe(document.querySelector("body"), {childList: true});
}
