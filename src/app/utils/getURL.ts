import { useSearchStore } from '../states/searchWindowState';
import type { Image } from '../models/search/Image';

const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to convert to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getURL = (url: string) => {
  const store = useSearchStore();
  if (url.startsWith('/')) {
    return `${store.pluginSettingData.nekoimage_api}${url}`; // local url
  }
  return url; // s3 url
};

export const getUrlBase64 = async (url: string) => {
  return urlToBase64(getURL(url));
};

export const getPreviewURL = (pic: Image) => {
  if (pic.thumbnail_url) {
    return getURL(pic.thumbnail_url);
  }
  return getURL(pic.url);
};
