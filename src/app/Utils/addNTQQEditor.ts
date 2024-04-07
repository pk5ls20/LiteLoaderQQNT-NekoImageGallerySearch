import {log} from "../../logs";

// special function, add pic to NTQQ's chat
export const addNTQQEditor = (message: { src: string; }) => {
    try {
        let emojiElement: any;
        const ckeditorInstance = document.querySelector(".ck.ck-content.ck-editor__editable")["ckeditorInstance"];
        const editorModel = ckeditorInstance.model;
        const editorSelection = editorModel.document.selection;
        const position = editorSelection.getFirstPosition();
        editorModel.change((writer: any) => {
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
        log(error)
    }
}