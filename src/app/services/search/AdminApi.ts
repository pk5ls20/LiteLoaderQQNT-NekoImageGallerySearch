// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Services/AdminApi.ts
import { NekoProtocol } from '../../models/search/ApiResponse';
import { getClient } from './baseSearchService';

export function deleteImage(id: string) {
  return getClient().delete<NekoProtocol>(`/admin/delete/${id}`);
}

export function updateOpt(id: string, starred: boolean) {
  return getClient().put<NekoProtocol>(`/admin/update_opt/${id}`, { starred });
}

export function uploadImage(file: File, local = true, starred = false, skipOcr = false, categories = '') {
  const formData = new FormData();
  formData.append('image_file', file);
  return getClient().post<NekoProtocol>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params: {
      local,
      starred,
      skip_ocr: skipOcr,
      categories
    }
  });
}
