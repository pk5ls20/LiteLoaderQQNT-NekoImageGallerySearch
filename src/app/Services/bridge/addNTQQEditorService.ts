interface addNTQQEditorService {
  set(message: { src: string }): void;
}

export class devAddNTQQEditorService implements addNTQQEditorService {
  set(message: { src: string }) {
    console.log(JSON.stringify(message));
  }
}

export class LLNTAddNTQQEditorService implements addNTQQEditorService {
  set(message: { src: string }) {
    try {
      const selectors = '.ck.ck-content.ck-editor__editable';
      const ckeditorElement = document.querySelector(selectors);
      if (ckeditorElement && 'ckeditorInstance' in ckeditorElement) {
        const ckeditorInstance = ckeditorElement['ckeditorInstance'] as any;
        const editorModel = ckeditorInstance.model;
        const editorSelection = editorModel.document.selection;
        const position = editorSelection.getFirstPosition();
        editorModel.change((writer: any) => {
          const data = {
            type: 'pic',
            src: message.src,
            picSubType: 0
          };
          const emojiData = {
            data: JSON.stringify(data)
          };
          const emojiElement = writer.createElement('msg-img', emojiData);
          writer.insert(emojiElement, position);
        });
      } else {
        console.log('CKEditor instance not found or the element does not exist.');
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
}
