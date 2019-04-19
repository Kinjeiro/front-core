import { appUrl } from '../../../../common/helpers/app-urls';
import apiConfig from '../../../../common/utils/create-api-config';
import getApiClient from '../../../../common/helpers/get-api-client';

export const API_PREFIX = 'instantly-attachment';
export const API_CONFIGS = {
  uploadAttachment: apiConfig(`/${API_PREFIX}`, 'POST'),
  getAttachmentInfo: apiConfig(`/${API_PREFIX}/{id}`, 'GET'),
  downloadAttachment: apiConfig(`/${API_PREFIX}/download/{id}`, 'GET'),
  deleteAttachment: apiConfig(`/${API_PREFIX}/{id}`, 'DELETE'),
};


export function getDownloadUrl(id) {
  return appUrl(API_CONFIGS.downloadAttachment.path.replace(/{id}/gi, id));
}

export async function apiUploadAttachment(fileObj, params = {}, onUploadProgress = null) {
  return getApiClient().uploadFile(
    API_CONFIGS.uploadAttachment,
    fileObj,
    params,
    {
      onUploadProgress,
    },
  );
}

export async function apiDownloadAttachment(serverAttachId, fileName = null) {
  return getApiClient().downloadFile(
    API_CONFIGS.downloadAttachment,
    fileName,
    {
      pathParams: {
        id: serverAttachId,
      },
    },
  );
}

export async function apiGetAttachmentInfo(id) {
  return getApiClient().api(API_CONFIGS.getAttachmentInfo, null, { pathParams: { id } });
}

export async function apiDeleteAttachment(id) {
  return getApiClient().api(API_CONFIGS.deleteAttachment, null, { pathParams: { id } });
}
