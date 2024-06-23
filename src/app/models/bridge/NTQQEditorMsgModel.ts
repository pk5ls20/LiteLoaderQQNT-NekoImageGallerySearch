import type { Image } from '../search/Image';
import type Element from '@ckeditor/ckeditor5-engine/src/model/element';
import type Writer from '@ckeditor/ckeditor5-engine/src/model/writer';

export type EditorImageMsgModel = {
  img: Image;
  picSubType: number;
};

export type NTQQEditorMsgModel = {
  data: string;
  paste: (writer: Writer) => Element;
};

export type NTQQEditorImageMsgModel = {
  type?: 'pic';
  src: string;
  picSubType: number;
};
