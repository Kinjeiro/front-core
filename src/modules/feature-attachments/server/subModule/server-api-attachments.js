import omit from 'lodash/omit';

import { DEFAULT_FILES_PARAM_NAME } from '../../../../common/utils/api-utils';

import serverConfig from '../../../../server/server-config';
import apiPluginFactory from '../../../../server/utils/api-plugin-factory';
import { downloadFile } from '../../../../server/utils/hapi-utils';
import logger from '../../../../server/helpers/server-logger';

import {
  API_CONFIGS,
} from '../../common/subModule/api-attachments';
import ACCESS_TYPE from '../../common/subModule/model-attachment-access';

async function wrapToDownloadUrl(attachment) {
  const attachmentFinal = await attachment;
  return omit(attachmentFinal, 'contentId');
}

// todo @ANKU @CRIT @MAIN - сделать модуль прав на объект и CRUD действия
function checkAttachmentAccess(attachment, currentUser, throwError = false) {
  const {
    uploadedBy,
    // accessType,
  } = attachment;
  // todo @ANKU @LOW - переделать на модуль прав
  const accessType = serverConfig.server.features.attachments.defaultAccess;

  if (currentUser && currentUser.roles.includes(serverConfig.common.features.auth.adminRoleName)) {
    return true;
  }

  let access;
  switch (accessType) {
    case ACCESS_TYPE.ACCESS_PUBLIC:
      access = true;
      break;
    case ACCESS_TYPE.ACCESS_AUTH:
      access = !!currentUser;
      break;
    case ACCESS_TYPE.ACCESS_OWNER_ONLY:
      access = currentUser && uploadedBy === currentUser.userId;
      break;
    default:
      access = currentUser && currentUser.permissions.includes(accessType);
  }
  if (throwError && !access) {
    throw new Error('У вас нет доступа к этой объекту.');
  }
  return access;
}

export default function createApiPlugins() {
  return [
    // apiPluginFactory(
    //   API_CONFIGS.uploadAttachment,
    //   async (requestData, request, reply) => {
    //     const {
    //       user: {
    //         userId,
    //       },
    //       services: {
    //         serviceAttachments,
    //       },
    //     } = request;
    //     const {
    //       description,
    //       [DEFAULT_FILES_PARAM_NAME]: file,
    //       ...contextParams
    //     } = requestData;
    //
    //     /*
    //      [
    //      {
    //      filename: 'marcus_avatar.jpg',
    //      path: '/var/folders/cq/143/T/146-20-dab',
    //      headers: {
    //      'content-disposition': 'form-data; name="avatar"; filename="marcus_avatar.jpg"',
    //      'content-type': 'image/jpeg'
    //      },
    //      bytes: 82521
    //      },
    //      ...
    //      ]
    //      */
    //     // const file = request.payload[`${DEFAULT_FILES_PARAM_NAME}[]`];
    //
    //     const {
    //       filename,
    //       path,
    //       headers: {
    //         // 'content-disposition',
    //         'content-type': contentType,
    //       },
    //       bytes,
    //     } = file;
    //
    //     const id = generateId();
    //     const attachment = createAttachment(
    //       id,
    //       filename,
    //       bytes,
    //       contentType,
    //       userId,
    //       getDownloadUrl(id),
    //       path,
    //       null,
    //       description,
    //       new Date(),
    //       contextParams,
    //     );
    //
    //     const attachmentFinal = await serviceAttachments.uploadAttachment(attachment, id);
    //     return reply(omit(attachmentFinal, 'serverPath'));
    //   },
    //   {
    //     routeConfig: {
    //       payload: {
    //         /*
    //          https://futurestud.io/tutorials/hapi-how-to-upload-files
    //
    //          output: 'data',
    //          output: 'stream',
    //          */
    //         output: 'file',
    //         parse: true,
    //         uploads: UPLOAD_PATH,
    //       },
    //     },
    //   },
    // ),
    apiPluginFactory(
      API_CONFIGS.uploadAttachment,
      async (requestData, request, reply) => {
        const {
          user: {
            userId,
          },
          services: {
            serviceAttachments,
            serviceAttachmentContents,
          },
        } = request;
        const {
          description,
          [DEFAULT_FILES_PARAM_NAME]: fileStream,
          ...contextParams
        } = requestData;

        /*
         this is stream !!!

         Readable {
         _readableState: ReadableState {
         _encoding: 'utf8',
         hapi: {
         filename: 'marcus_avatar.jpg',
         headers: [Object]
         }
         }
         }
         */
        const {
          hapi: {
            filename: fileName,
            headers: {
              // 'content-disposition',
              'content-type': contentType,
            },
          },
        } = fileStream;

        logger.debug(`uploadAttachment "${fileName}" by "${userId}"`);

        // upload data
        const {
          id: contentId,
          length: size,
        } = await serviceAttachmentContents.uploadFile(fileName, contentType, fileStream);

        return reply(wrapToDownloadUrl(serviceAttachments.createRecord({
          fileName,
          // preview:        { type: String }, - // todo @ANKU @LOW -
          description,
          // uploadedOn:     { type: Date }, - auto default
          uploadedBy: userId,
          size,
          type: contentType,
          contextParams,
          contentId,
        })));
      },
      {
        routeConfig: {
          payload: {
            /*
             https://futurestud.io/tutorials/hapi-how-to-upload-files

             output: 'file',
             output: 'data', // buffer
             output: 'stream',
             */
            // output: 'file',
            // parse: true,
            // uploads: UPLOAD_PATH,

            output: 'stream',
            parse: true,
          },
        },
      },
    ),
    apiPluginFactory(
      API_CONFIGS.getAttachmentInfo,
      async (requestData, request, reply) => {
        const {
          params: {
            id,
          },
          services: {
            serviceAttachments,
          },
        } = request;

        return reply(wrapToDownloadUrl(serviceAttachments.readRecord(id)));
      },
    ),
    apiPluginFactory(
      API_CONFIGS.downloadAttachment,
      async (requestData, request, reply) => {
        const {
          user,
          params: {
            id,
          },
          services: {
            serviceAttachments,
            serviceAttachmentContents,
          },
        } = request;

        const attachment = await serviceAttachments.readRecord(id);
        logger.debug(`downloadAttachment "${attachment.fileName}" [${id}] by "${user && user.userId}"`);

        checkAttachmentAccess(attachment, user);
        const {
          contentId,
        } = attachment;

        return downloadFile(reply, await serviceAttachmentContents.downloadFile(contentId));
      },
      {
        routeConfig: {
          auth: false,
        },
      },
    ),
    apiPluginFactory(
      API_CONFIGS.deleteAttachment,
      async (requestData, request, reply) => {
        const {
          user,
          params: {
            id,
          },
          services: {
            serviceAttachments,
            serviceAttachmentContents,
          },
        } = request;

        const attachment = await serviceAttachments.readRecord(id);
        logger.debug(`deleteAttachment "${attachment.fileName}" [${id}] by "${user.userId}"`);

        checkAttachmentAccess(attachment, user);
        const {
          contentId,
        } = attachment;

        // сначала удаляем контент из базы
        await serviceAttachmentContents.deleteFile(contentId);
        // потом удаляем инфу об аттачменте
        await serviceAttachments.removeRecord(id);

        return reply();
      },
    ),
  ];
}
