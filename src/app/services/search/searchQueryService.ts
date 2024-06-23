// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Services/SearchQuery.ts
import { SearchBasis } from '../../models/search/SearchBasis';
import { SearchFilterOptions } from '../../models/search/SearchFilterOptions';
import type { SearchApiResponse } from '../../models/search/SearchApiResponse';
import type { Image } from '../../models/search/Image';
import type { AdvancedSearchModel, CombinedSearchModel } from '../../models/search/AdvancedSearchModel';
import { getClient } from './baseSearchService';

export abstract class SearchQueryService {
  public filterOptions: SearchFilterOptions | null = null;

  abstract querySearch(count: number, skip: number): Promise<SearchApiResponse>;

  public getFilterOptions(): SearchFilterOptions | null {
    return this.filterOptions;
  }
}

export class TextSearchQuery extends SearchQueryService {
  constructor(
    public query: string,
    public searchBasis: SearchBasis = SearchBasis.vision,
    public exact = false
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(`/search/text/${encodeURIComponent(this.query)}`, {
      params: {
        count: count,
        skip: skip,
        basis: this.searchBasis,
        exact: this.exact || undefined,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}

export class ImageSearchQuery extends SearchQueryService {
  constructor(public image: Blob) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const formData = new FormData();
    formData.append('image', this.image);
    const response = await getClient().post<SearchApiResponse>(`/search/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        count: count,
        skip: skip,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}

export class SimilarSearchQuery extends SearchQueryService {
  constructor(
    public img: Image,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(`/search/similar/${encodeURIComponent(this.img.id)}`, {
      params: {
        count: count,
        skip: skip,
        basis: this.searchBasis,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}

export class RandomSearchQuery extends SearchQueryService {
  public seed?: number;
  constructor(reproducible = true) {
    super();
    if (reproducible) {
      this.seed = Math.floor(Math.random() * Math.pow(2, 31));
    }
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().get<SearchApiResponse>(`/search/random`, {
      params: {
        seed: this.seed,
        count,
        skip,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}

export class AdvancedSearchQuery extends SearchQueryService {
  constructor(
    public searchModel: AdvancedSearchModel,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().post<SearchApiResponse>(`/search/advanced`, this.searchModel, {
      params: {
        count: count,
        skip: skip,
        basis: this.searchBasis,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}

export class CombinedSearchQuery extends SearchQueryService {
  constructor(
    public searchModel: CombinedSearchModel,
    public searchBasis: SearchBasis = SearchBasis.vision
  ) {
    super();
  }

  async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
    const response = await getClient().post<SearchApiResponse>(`/search/combined`, this.searchModel, {
      params: {
        count: count,
        skip: skip,
        basis: this.searchBasis,
        ...this.getFilterOptions()
      }
    });
    return response.data;
  }
}
