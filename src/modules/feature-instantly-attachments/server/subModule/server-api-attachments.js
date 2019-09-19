import omit from 'lodash/omit';

import { DEFAULT_FILES_PARAM_NAME } from '../../../../common/utils/api-utils';

import serverConfig from '../../../../server/server-config';
import apiPluginFactory, { API_PLUGIN_OPTIONS } from '../../../../server/utils/api-plugin-factory';
import { downloadFile } from '../../../../server/utils/hapi-utils';
import logger from '../../../../server/helpers/server-logger';

import {
  API_CONFIGS,
} from '../../common/subModule/api-attachments';
import ACCESS_TYPE from '../../common/subModule/model-attachment-access';
import { createAttachment, createServerAttachment } from '../../common/subModule/model-attachment';

async function wrapToDownloadUrl(attachment) {
  const attachmentFinal = await attachment;
  return omit(attachmentFinal, 'contentId');
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
        logger.debug(`uploadAttachment "${fileName}"[${contentType}] by "${userId}"`);

        // upload data
        const {
          id: contentId,
          length: size,
        } = await serviceAttachmentContents.uploadFile(fileName, contentType, fileStream);
        logger.debug(`-- size = "${size}"`);

        const attachmentData = createAttachment(
          null,
          fileName,
          size,
          contentType,
          userId,
          null,
          null, // todo @ANKU @LOW - preview
          description,
          Date.now(),
          contextParams,
        );

        const serverAttachmentData = createServerAttachment(
          attachmentData,
          contentId,
        );

        return reply(wrapToDownloadUrl(serviceAttachments.createRecord(serverAttachmentData)));
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


        if (!serviceAttachments.checkAttachmentAccess(attachment)) {
          logger.error('-- not permitted');
          return reply().code(403); // Forbidden
        }
        const {
          contentId,
        } = attachment;

        return downloadFile(reply, await serviceAttachmentContents.downloadFile(contentId));
      },
      {
        // routeConfig: {
        //   auth: false,
        // },
        [API_PLUGIN_OPTIONS.AUTH_IF_EXISTS]: true,
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

        if (!serviceAttachments.checkAttachmentAccess(attachment)) {
          logger.error('-- not permitted');
          return reply().code(403); // Forbidden
        }
        const {
          contentId,
        } = attachment;

        // сначала удаляем контент из базы
        await serviceAttachmentContents.deleteFile(contentId);
        // потом удаляем инфу об аттачменте
        await serviceAttachments.deleteRecord(id);

        return reply();
      },
    ),
  ];
}
