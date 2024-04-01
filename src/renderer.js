const { createApp, ref, onMounted } = await import('https://unpkg.com/vue@3/dist/vue.esm-browser.js');
const plugin_path = LiteLoader.plugins["image_search"].path.plugin;

document.body.insertAdjacentHTML('afterbegin', await (await fetch(`local:///${plugin_path}/src/ui/searchWindow.html`)).text());

const nekoImageWindow = document.getElementById('search-window');
const nekoImageMarkWindow = document.getElementById('search-mark-window');
const nekoImageDialog = document.getElementById('search-dialog');
const iconHtml = await (await fetch(`local:///${plugin_path}/src/assets/svg/logo.svg`)).text();

function hideWindow() {
    nekoImageWindow.style.visibility = 'hidden';
    nekoImageMarkWindow.style.transitionDelay = '150ms';
    nekoImageDialog.style.transitionDelay = '0ms';
    nekoImageMarkWindow.style.opacity = 0;
    nekoImageDialog.style.opacity = 0;
    nekoImageDialog.style.transform = 'translate(0px, -20px)';
}

nekoImageMarkWindow.addEventListener('click', hideWindow);

// add emoji to editor
function add_editor(message) {
    try {
        let emojiElement;
        const ckeditorInstance = document.querySelector(".ck.ck-content.ck-editor__editable").ckeditorInstance;
        const editorModel = ckeditorInstance.model;
        const editorSelection = editorModel.document.selection;
        const position = editorSelection.getFirstPosition();
        editorModel.change(writer => {
            const data = {
                "type": "pic",
                "src": message.src,
                "picSubType": 0
            }
            const emojiData = {
                data: JSON.stringify(data)
            }
            emojiElement = writer.createElement('msg-img', emojiData);
            writer.insert(emojiElement, position);
        });
    } catch (error) {
        console.log(error)
    }
}

// vue app
const app = createApp({
    setup() {
        const query = ref('');
        const searchResults = ref([]);
        const settings = ref({});

        function handleImageClick(img) {
            console.log(`Image Clicked: ${img.url}`);
            console.log(`Image ID: ${img.id}`);
            add_editor({
                "src": `${settings.value.nekoimage_api}${img.url}`
            });
            hideWindow();
        }

        async function performSearch() {
            console.log(settings.value)
            const url = `${settings.value.nekoimage_api}/search/text/${query.value}?count=80&skip=0&basis=ocr`;
            const authHeader = settings.value.nekoimage_access_token ? {'X-Access-Token': settings.value.nekoimage_access_token} : {};
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: authHeader
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                const json = await response.json();
                if (json && json.result) {
                    searchResults.value = json.result.map(r => r.img);
                }
            } catch (error) {
                console.error('Fetch error:', error.message);
            }
        }

        onMounted(async () => {
            settings.value = await imageSearch.getSettings();
            console.log('Mounted', JSON.stringify(settings.value));
        });

        return {
            query, searchResults, performSearch, handleImageClick, settings
        };
    }
})

app.mount("#search-dialog");

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            const nodes = Array.from(mutation.addedNodes);
            nodes.forEach(async node => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('chat-func-bar')) {
                    const funcBar = node.getElementsByTagName('div')[0];
                    const openButton = funcBar.lastElementChild.cloneNode(true);
                    const icon = openButton.getElementsByTagName('i')[0];
                    icon.innerHTML = iconHtml;
                    openButton.addEventListener('click', () => {
                        nekoImageWindow.style.visibility = 'visible';
                        nekoImageMarkWindow.style.transitionDelay = '0ms';
                        nekoImageDialog.style.transitionDelay = '150ms';
                        nekoImageMarkWindow.style.opacity = 1;
                        nekoImageDialog.style.opacity = 1;
                        nekoImageDialog.style.transform = 'translate(0px, 0px)';
                    });
                    funcBar.appendChild(openButton);
                }
            });
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'q-theme') {
            app.isDarkMode = document.body.getAttribute('q-theme') === 'dark';
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });

export const onSettingWindowCreated = async view => {
    try {
        const html_file_path = `local:///${plugin_path}/src/ui/settings.html`;
        view.innerHTML = await (await fetch(html_file_path)).text();
        document.querySelectorAll(".nav-item.liteloader").forEach((node) => {
            if (node.textContent === "Image Search") {
                node.querySelector(".q-icon").innerHTML = iconHtml;
            }
        });
        const settings = await imageSearch.getSettings();
        console.log("Settings", JSON.stringify(settings))
        const api_input = view.querySelector(".image_search .api-input");
        const reset = view.querySelector(".image_search .reset");
        const apply = view.querySelector(".image_search .apply");
        api_input.value = settings.nekoimage_api;
        apply.addEventListener("click", () => {
            settings.nekoimage_api = api_input.value;
            imageSearch.setSettings(settings);
            alert("API Applied");
        });
        reset.addEventListener("click", () => {
            api_input.value = "";
            settings.nekoimage_api = api_input.value;
            imageSearch.setSettings(settings);
            alert("API Reset");
        });
        const nekoimage_access_token = view.querySelector(".image_search .right-target-lang");
        const nekoimage_access_token_apply = view.querySelector(".image_search .right-target-lang-apply");
        const nekoimage_access_token_reset = view.querySelector(".image_search .right-target-lang-reset");
        const nekoimage_admin_token = view.querySelector(".image_search .chat-target-lang");
        const nekoimage_admin_token_apply = view.querySelector(".image_search .chat-target-lang-apply");
        const nekoimage_admin_token_reset = view.querySelector(".image_search .chat-target-lang-reset");

        nekoimage_access_token.value = settings.nekoimage_admin_token;
        nekoimage_admin_token.value = settings.nekoimage_admin_token;
        nekoimage_access_token_apply.addEventListener("click", () => {
            settings.nekoimage_access_token = nekoimage_access_token.value;
            imageSearch.setSettings(settings);
            alert("Access Token Applied");
        });
        nekoimage_access_token_reset.addEventListener("click", () => {
            nekoimage_access_token.value = "";
            settings.nekoimage_access_token = "";
            imageSearch.setSettings(settings);
            alert("Access Token Reset");
        });
        nekoimage_admin_token_apply.addEventListener("click", () => {
            settings.nekoimage_admin_token = nekoimage_admin_token.value;
            imageSearch.setSettings(settings);
            alert("Admin Token Applied");
        });
        nekoimage_admin_token_reset.addEventListener("click", () => {
            nekoimage_admin_token.value = "";
            settings.nekoimage_admin_token = "";
            imageSearch.setSettings(settings);
            alert("Admin Token Reset");
        });
    } catch (error) {
        console.log("[Error in setting]", error);
    }
}
