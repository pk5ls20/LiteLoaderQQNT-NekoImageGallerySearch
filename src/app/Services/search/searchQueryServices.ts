import {AdvancedSearchModel, CombinedSearchModel} from '../../Models/AdvancedSearchModel';
import {SearchApiResponse} from '../../Models/SearchApiResponse';
import {SearchBasis} from '../../Models/SearchBasis';
import {SearchFilterOptions} from '../../Models/SearchFilterOptions';
import {getClient} from './baseSearchService';

export abstract class SearchQueryServices {

    public filterOptions: SearchFilterOptions | null = null;

    abstract querySearch(count: number, skip: number): Promise<SearchApiResponse>;

    public getFilterOptions(): SearchFilterOptions | null {
        return this.filterOptions;
    }
}

export class TextSearchQuery extends SearchQueryServices {
    constructor(
        public query: string,
        public searchBasis: SearchBasis = SearchBasis.vision,
        public exact = false
    ) {
        super();
    }

    async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
        const response = await getClient().get<SearchApiResponse>(
            `/search/text/${encodeURIComponent(this.query)}`,
            {
                params: {
                    count: count,
                    skip: skip,
                    basis: this.searchBasis,
                    exact: this.exact || undefined,
                    ...this.getFilterOptions(),
                },
            }
        );
        return response.data;
    }
}

export class ImageSearchQuery extends SearchQueryServices {
    constructor(public image: Blob) {
        super();
    }

    async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
        const formData = new FormData();
        formData.append('image', this.image);
        const response = await getClient().post<SearchApiResponse>(
            `/search/image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                params: {
                    count: count,
                    skip: skip,
                    ...this.getFilterOptions(),
                },
            }
        );
        return response.data;
    }
}

export class SimilarSearchQuery extends SearchQueryServices {
    constructor(
        public id: string,
        public searchBasis: SearchBasis = SearchBasis.vision
    ) {
        super();
    }

    async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
        const response = await getClient().get<SearchApiResponse>(
            `/search/similar/${encodeURIComponent(this.id)}`,
            {
                params: {
                    count: count,
                    skip: skip,
                    basis: this.searchBasis,
                    ...this.getFilterOptions(),
                },
            }
        );
        return response.data;
    }
}

export class RandomSearchQuery extends SearchQueryServices {
    constructor() {
        super();
    }

    async querySearch(count = 20): Promise<SearchApiResponse> {
        const response = await getClient().get<SearchApiResponse>(
            `/search/random`,
            {
                params: {
                    count: count,
                    ...this.getFilterOptions()
                },
            }
        );
        return response.data;
    }
}

export class AdvancedSearchQuery extends SearchQueryServices {
    constructor(
        public searchModel: AdvancedSearchModel,
        public searchBasis: SearchBasis = SearchBasis.vision
    ) {
        super();
    }

    async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
        const response = await getClient().post<SearchApiResponse>(
            `/search/advanced`,
            this.searchModel,
            {
                params: {
                    count: count,
                    skip: skip,
                    basis: this.searchBasis,
                    ...this.getFilterOptions(),
                },
            }
        );
        return response.data;
    }
}

export class CombinedSearchQuery extends SearchQueryServices {
    constructor(
        public searchModel: CombinedSearchModel,
        public searchBasis: SearchBasis = SearchBasis.vision
    ) {
        super();
    }

    async querySearch(count = 20, skip = 0): Promise<SearchApiResponse> {
        const response = await getClient().post<SearchApiResponse>(
            `/search/combined`,
            this.searchModel,
            {
                params: {
                    count: count,
                    skip: skip,
                    basis: this.searchBasis,
                    ...this.getFilterOptions(),
                },
            }
        );
        return response.data;
    }
}