// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Models/SearchApiResponse.ts

import type { NekoProtocol } from './ApiResponse';
import type { SearchResult } from './SearchResult';

export interface SearchApiResponse extends NekoProtocol {
  query_id: string;
  result: SearchResult[];
}
