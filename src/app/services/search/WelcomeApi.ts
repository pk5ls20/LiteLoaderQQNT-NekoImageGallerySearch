// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Services/WelcomeApi.ts
import type { HomeApiResponse } from '../../models/search/HomeApiResponse';
import { getClient } from './baseSearchService';

export async function WelcomeApi() {
  const resp = await getClient().get<HomeApiResponse>('/');
  return resp.data;
}
