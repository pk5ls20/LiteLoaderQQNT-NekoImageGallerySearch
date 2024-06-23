// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Models/AdvancedSearchModel.ts
export enum AdvancedSearchMode {
  average = 'average',
  best = 'best'
}

export interface AdvancedSearchModel {
  criteria: string[];
  negative_criteria: string[];
  mode: AdvancedSearchMode;
}

export interface CombinedSearchModel extends AdvancedSearchModel {
  extra_prompt: string;
}
