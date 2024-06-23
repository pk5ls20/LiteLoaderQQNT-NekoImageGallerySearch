// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Models/SearchFilterOptions.ts
export class SearchFilterOptions {
  constructor(
    public preferred_ratio?: number,
    public ratio_tolerance?: number,
    public min_width?: number,
    public min_height?: number,
    public starred?: boolean,
    public categories?: string,
    public categories_negative?: string
  ) {}
}
