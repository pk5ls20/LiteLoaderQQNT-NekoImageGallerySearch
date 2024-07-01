import { v5 as uuid5 } from 'uuid';

const NAMESPACE_STR = 'github.com/hv0905/NekoImageGallery';
const namespaceUUID: string = uuid5(NAMESPACE_STR, uuid5.DNS);

export async function generateUUID(fileInput: Uint8Array) {
  const hashBuffer = await crypto.subtle.digest('SHA-1', fileInput);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return uuid5(hashHex, namespaceUUID);
}
