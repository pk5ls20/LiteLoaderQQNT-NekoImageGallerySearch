import type { NekoProtocol } from './ApiResponse';
import type { SearchResult } from './SearchResult';

export interface SearchApiResponse extends NekoProtocol {
  query_id: string;
  result: SearchResult[];
}
