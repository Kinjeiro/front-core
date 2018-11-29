import {
  createReducer,
  createAllTypesMapCollectionReducer,
} from '../../../../common/app-redux/utils';
import createStatusReducer from '../../../../common/app-redux/helpers/create-status-reducer';

import * as api from './api-attachments';

// ======================================================
// INITIAL STATE
// ======================================================
export const attachInitialState = {
  uuid: undefined,
  /*
   // service info
   uuid: generateId(),
   file, // File
   isNew: true,
   loaded: 0,

   // common info
   id: null,
   fileName: name,
   preview: null,
   description: null,
   uploadedOn: null,
   size,
   type,
   */
  data: undefined,

  status: undefined,
  statusGetAttachInfo: undefined,
  statusDownloadAttachment: undefined,
  statusUploadAttach: undefined,
  statusDeleteAttach: undefined,
};

export const byIdsInitialState = {};

// ======================================================
// TYPES
// ======================================================
const PREFIX = 'attachments';
export const TYPES = {
  GET_ATTACH_INFO_FETCH:     `${PREFIX}/GET_ATTACH_INFO_FETCH`,
  GET_ATTACH_INFO_SUCCESS:   `${PREFIX}/GET_ATTACH_INFO_SUCCESS`,
  GET_ATTACH_INFO_FAIL:      `${PREFIX}/GET_ATTACH_INFO_FAIL`,

  DOWNLOAD_ATTACHMENT_FETCH:     `${PREFIX}/DOWNLOAD_ATTACHMENT_FETCH`,
  DOWNLOAD_ATTACHMENT_SUCCESS:   `${PREFIX}/DOWNLOAD_ATTACHMENT_SUCCESS`,
  DOWNLOAD_ATTACHMENT_FAIL:      `${PREFIX}/DOWNLOAD_ATTACHMENT_FAIL`,

  UPLOAD_ATTACH_FETCH:     `${PREFIX}/UPLOAD_ATTACH_FETCH`,
  UPLOAD_ATTACH_FAIL:      `${PREFIX}/UPLOAD_ATTACH_FAIL`,
  UPLOAD_ATTACH_SUCCESS:   `${PREFIX}/UPLOAD_ATTACH_SUCCESS`,

  UPLOADING_CHANGE: `${PREFIX}/UPLOADING_CHANGE`,

  CLEAR_ATTACHMENT: `${PREFIX}/CLEAR_ATTACHMENT`,

  DELETE_ATTACH_FETCH:     `${PREFIX}/DELETE_ATTACH_FETCH`,
  DELETE_ATTACH_SUCCESS:   `${PREFIX}/DELETE_ATTACH_SUCCESS`,
  DELETE_ATTACH_FAIL:      `${PREFIX}/DELETE_ATTACH_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================

export function getActions({
  apiUploadAttachment,
  apiDownloadAttachment,
  apiGetAttachmentInfo,
  apiDeleteAttachment,
}) {

  function actionUploadingChange(uuid, updatedData) {
    return {
      uuid,
      type: TYPES.UPLOADING_CHANGE,
      payload: updatedData,
    };
  }

  return {
    /*
     Добавляем в базу, если данные уже пришли с сервера
     */
    actionGetAttachmentInfo(serverAttachId) {
      return {
        uuid: serverAttachId,
        types: [TYPES.GET_ATTACH_INFO_FETCH, TYPES.GET_ATTACH_INFO_SUCCESS, TYPES.GET_ATTACH_INFO_FAIL],
        payload: apiGetAttachmentInfo(serverAttachId),
      };
    },

    actionDownloadAttachment(serverAttachId) {
      return {
        uuid: serverAttachId,
        types: [TYPES.DOWNLOAD_ATTACHMENT_FETCH, TYPES.DOWNLOAD_ATTACHMENT_SUCCESS, TYPES.DOWNLOAD_ATTACHMENT_FAIL],
        payload: apiDownloadAttachment(serverAttachId),
      };
    },

    actionUploadingChange,

    actionUploadAttach(attachUuid, file, context = {}) {
      return (dispatch) => {
        return dispatch({
          uuid: attachUuid,
          types: [TYPES.UPLOAD_ATTACH_FETCH, TYPES.UPLOAD_ATTACH_SUCCESS, TYPES.UPLOAD_ATTACH_FAIL],
          payload: apiUploadAttachment(
            file,
            context,
            // html5 on progress event -- http://christopher5106.github.io/web/2015/12/13/HTML5-file-image-upload-and-resizing-javascript-with-progress-bar.html
            /*
             {
               "isTrusted": true,
               "percent": 100,
               "direction": "upload" // download
               "loaded": 15000
               "total": 34200
             }
            */
            (event) => (event.direction === 'upload' && dispatch(actionUploadingChange(attachUuid, {
              loaded: event.loaded,
              total: event.total,
              isLoaded: event.loaded >= event.total,
            }))),
          ),
        });
      };
    },

    actionClearAttachment(uuid) {
      return {
        uuid,
        type: TYPES.CLEAR_ATTACHMENT,
      };
    },

    actionDeleteAttach(serverAttachId) {
      return {
        uuid: serverAttachId,
        types: [TYPES.DELETE_ATTACH_FETCH, TYPES.DELETE_ATTACH_SUCCESS, TYPES.DELETE_ATTACH_FAIL],
        payload: apiDeleteAttachment(serverAttachId),
      };
    },
  };
}

export const actions = getActions(api);

// ======================================================
// REDUCER
// ======================================================
const attachReducer = createReducer(
  attachInitialState,
  {
    [TYPES.UPLOADING_CHANGE]:
      (state, action, updatedData) => ({
        ...state,
        data: {
          ...state.data,
          ...updatedData,
        },
      }),

    [TYPES.UPLOAD_ATTACH_SUCCESS]:
      (state, action, attachData) => ({
        ...state,
        data: {
          ...state.data,
          ...attachData,
          isNew: false,
          file: null,
          preview: attachData.preview || state.data.preview,
        },
      }),
  },
  {
    status: createStatusReducer(
      [TYPES.GET_ATTACH_INFO_FETCH, TYPES.GET_ATTACH_INFO_SUCCESS, TYPES.GET_ATTACH_INFO_FAIL],
      [TYPES.DOWNLOAD_ATTACHMENT_FETCH, TYPES.DOWNLOAD_ATTACHMENT_SUCCESS, TYPES.DOWNLOAD_ATTACHMENT_FAIL],
      [TYPES.UPLOAD_ATTACH_FETCH, TYPES.UPLOAD_ATTACH_SUCCESS, TYPES.UPLOAD_ATTACH_FAIL],
      [TYPES.DELETE_ATTACH_FETCH, TYPES.DELETE_ATTACH_SUCCESS, TYPES.DELETE_ATTACH_FAIL],
    ),
    statusGetAttachInfo: createStatusReducer(
      TYPES.GET_ATTACH_INFO_FETCH, TYPES.GET_ATTACH_INFO_SUCCESS, TYPES.GET_ATTACH_INFO_FAIL,
    ),
    statusDownloadAttachment: createStatusReducer(
      TYPES.DOWNLOAD_ATTACHMENT_FETCH, TYPES.DOWNLOAD_ATTACHMENT_SUCCESS, TYPES.DOWNLOAD_ATTACHMENT_FAIL,
    ),
    statusUploadAttach: createStatusReducer(
      TYPES.UPLOAD_ATTACH_FETCH, TYPES.UPLOAD_ATTACH_SUCCESS, TYPES.UPLOAD_ATTACH_FAIL,
    ),
    statusDeleteAttach: createStatusReducer(
      TYPES.DELETE_ATTACH_FETCH, TYPES.DELETE_ATTACH_SUCCESS, TYPES.DELETE_ATTACH_FAIL,
    ),
  },
);

export function initAttach(id, attachData, action) {
  const attachState = attachReducer(undefined, action);
  return (attachData || id)
    ? {
      ...attachState,
      // если новый создается на клиенте - то uuid будет а серверного не будет пока не создасться
      // а если уже загружаем уже существующие то uuid = serverId
      uuid: id,
      data: attachData,
    }
    : attachState;
}

const reducer = createReducer(
  byIdsInitialState,
  {
    // [TYPES.ADD_ATTACH]:
    //  (state, action, payload) => ({
    //    ...state,
    //    [payload.uuid]: initAttach(payload.uuid, payload.attachData, action)
    //  }),
    [TYPES.GET_ATTACH_INFO_SUCCESS]:
      (state, action, attachData) => ({
        ...state,
        [action.uuid]: initAttach(attachData.id, attachData, action),
      }),
    [TYPES.UPLOAD_ATTACH_FETCH]:
      (state, action) => ({
        ...state,
        [action.uuid]: initAttach(
          action.uuid,
          {
            isNew: true,
            uuid: action.uuid,
          },
          action,
        ),
      }),
    [TYPES.UPLOAD_ATTACH_SUCCESS]:
      (state, action) => ({
        ...state,
        [action.uuid]: attachReducer(state[action.uuid], action),
      }),
    [TYPES.DELETE_ATTACH_SUCCESS]:
      (state, action) => {
        const newState = { ...state };
        delete newState[action.uuid];
        return newState;
      },
    [TYPES.CLEAR_ATTACHMENT]:
      (state, action) => {
        const newState = { ...state };
        delete newState[action.uuid];
        return newState;
      },
  },
  null,
  // вверху указаны не все статусы. Необходимо прогонять через attachReducer чтобы менять статусы
  createAllTypesMapCollectionReducer(TYPES, attachReducer),
);

export default reducer;
