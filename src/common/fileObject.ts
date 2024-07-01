// TODO: add useful method
export class FileObject {
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly type: string,
    public readonly content: ArrayBuffer | SharedArrayBuffer
  ) {}
}
