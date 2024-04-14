import iconHtml from '../assets/logo.svg?raw';

const menuID = "nekoimg-i2i-menu"

class imageContainer {
    src: string;

    constructor(src: string) {
        this.src = src;
    }

    async toBlob(): Promise<Blob> {
        if (this.src.startsWith('data:')) {
            return this.convertBase64ToBlob();
        } else if (this.src.startsWith('appimg://')) {
            return await this.convertImageUrlToBlob();
        } else {
            throw new Error("Unsupported src type");
        }
    }

    convertBase64ToBlob() {
        const base64Content = this.src.split(';base64,').pop();
        const binary = atob(base64Content);
        const length = binary.length;
        const bytes = new Uint8Array(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Blob([bytes], {type: 'image/png'});
    }

    async convertImageUrlToBlob() {
        const pathContent = this.src.split('appimg://').pop();
        return await window.imageSearch.getLocalFileAsBlob(decodeURIComponent(pathContent));
    }
}

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
    item.addEventListener("click", async ()  => {
        await callback();
        qContextMenu.remove();
    });
    qContextMenu.appendChild(item);
}

export const addQContextMenuMain = async () => {
    let isRightClick: boolean = false;
    let imageObject: imageContainer = null;
    let imgEl = null;
    const haveImgContent = () => imgEl.classList.contains("image-content") && imgEl?.getAttribute('src')
    document.addEventListener("mouseup", (event) => {
        if (event.button === 2) {
            isRightClick = true;
            imgEl = event.target;
            if (haveImgContent()) {
                imageObject = new imageContainer(imgEl?.src?.toString());
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
        const qContextMenu = document.querySelector(".q-context-menu");
        if (qContextMenu && imageObject) {
            const currentImageObject = imageObject;
            addQContextMenu(
                qContextMenu,
                iconHtml,
                "Image Search",
                async () => {
                    const fileBlobContent = await currentImageObject.toBlob();
                    window.imageSearch.postAppImageSearchReq(fileBlobContent);
                }
            );
        }
    }).observe(document.querySelector("body"), {childList: true});
}
