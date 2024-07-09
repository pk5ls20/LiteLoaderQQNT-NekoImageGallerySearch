export class ImgObject {
  public readonly name: string;
  public readonly path?: string;
  public readonly type: string;
  public readonly content: ArrayBuffer | SharedArrayBuffer;

  constructor(name: string, type: string, content: ArrayBuffer | SharedArrayBuffer, path?: string) {
    this.name = name;
    this.type = type;
    this.content = content;
    this.path = path;
  }
}
