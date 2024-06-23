// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Models/SearchResult.ts
import type { Image } from './Image';

export interface SearchResult {
  score: number;
  img: Image;
}
