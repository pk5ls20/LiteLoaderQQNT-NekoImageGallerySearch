import type ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type Model from '@ckeditor/ckeditor5-engine/src/model/model';
import type DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import type Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import type Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { NTQQEditorMsg } from '../editor/editorMsgService';

interface addNTQQEditorService {
  set(message: NTQQEditorMsg[]): void;
}

export class devAddNTQQEditorService implements addNTQQEditorService {
  set(message: NTQQEditorMsg[]) {
    console.log(JSON.stringify(message));
  }
}

export class LLNTAddNTQQEditorService implements addNTQQEditorService {
  set(message: NTQQEditorMsg[]) {
    try {
      const selectors = '.ck.ck-content.ck-editor__editable';
      const ckeditorElement = document.querySelector(selectors);
      if (ckeditorElement && 'ckeditorInstance' in ckeditorElement) {
        const ckeditorInstance = ckeditorElement['ckeditorInstance'] as ClassicEditor;
        const editorModel = ckeditorInstance.model as Model;
        const editorSelection = editorModel.document.selection as DocumentSelection;
        const position = editorSelection.getFirstPosition();
        if (!position) {
          console.log('LLNTAddNTQQEditorService: editorSelection.getFirstPosition() not found.');
          return;
        }
        editorModel.change((writer: Writer) => {
          message.forEach((msg: NTQQEditorMsg) => {
            const emojiElement: Element = msg.paste(writer);
            writer.insert(emojiElement, position);
          });
        });
      } else {
        console.log('CKEditor instance not found or the element does not exist.');
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
}
