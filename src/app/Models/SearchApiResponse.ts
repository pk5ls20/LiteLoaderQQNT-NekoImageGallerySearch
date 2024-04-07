import { NekoProtocol } from './ApiResponse';
import { SearchResult } from './SearchResult';

export interface SearchApiResponse extends NekoProtocol {
  query_id: string;
  result: SearchResult[];
}
