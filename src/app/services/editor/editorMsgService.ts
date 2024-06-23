import type { Image } from '../../models/search/Image';
import type {
  EditorImageMsgModel,
  NTQQEditorImageMsgModel,
  NTQQEditorMsgModel
} from '../../models/bridge/NTQQEditorMsgModel';
import type Element from '@ckeditor/ckeditor5-engine/src/model/element';
import type Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import { getURL } from '../../utils/getURL';

export class EditorImageMsg implements EditorImageMsgModel {
  img: Image;
  picSubType: number;

  constructor(img: Image, picSubType: number) {
    this.img = img;
    this.picSubType = picSubType;
  }
}

export abstract class NTQQEditorMsg implements NTQQEditorMsgModel {
  data: string;

  protected constructor(data: string) {
    this.data = data;
  }

  abstract paste(writer: Writer): Element;
}

export class NTQQEditorImageMsg extends NTQQEditorMsg implements NTQQEditorImageMsgModel {
  src: string;
  picSubType: number;

  constructor(msg: EditorImageMsg) {
    super(JSON.stringify({ type: 'pic', src: getURL(msg.img.url), picSubType: msg.picSubType }));
    this.src = getURL(msg.img.url);
    this.picSubType = msg.picSubType;
  }

  paste(writer: Writer): Element {
    const emojiData = { data: this.data };
    return writer.createElement('msg-img', emojiData);
  }
}
