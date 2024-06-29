export class imageContainer {
  src: string;

  constructor(src: string) {
    this.src = src;
  }

  async toBlob(): Promise<Blob | null> {
    if (this.src.startsWith('data:')) {
      return this.convertBase64ToBlob();
    } else if (this.src.startsWith('appimg://')) {
      return await this.convertImageUrlToBlob();
    } else {
      throw new Error('Unsupported src type');
    }
  }

  convertBase64ToBlob() {
    try {
      const base64Content = this.src.split(';base64,').pop();
      const binary = atob(base64Content ?? '');
      const length = binary.length;
      const bytes = new Uint8Array(new ArrayBuffer(length));
      for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'image/png' });
    } catch (e) {
      return null;
    }
  }

  async convertImageUrlToBlob() {
    const pathContent = this.src.split('appimg://').pop();
    return await window.imageSearch.getLocalFileAsBlob(decodeURIComponent(pathContent ?? ''));
  }
}
