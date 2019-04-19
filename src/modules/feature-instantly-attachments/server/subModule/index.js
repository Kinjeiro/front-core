import SubModuleFactory from '../../../SubModuleFactory';

import createApiPlugins from './server-api-attachments';

import ServiceAttachments from './ServiceAttachments';
import ServiceAttachmentContents from './ServiceAttachmentContents';
import ServiceAttachmentsMock from './ServiceAttachmentsMock';
import ServiceAttachmentContentsMock from './ServiceAttachmentContentsMock';

export default SubModuleFactory.createServerSubModule({
  getServerApi: createApiPlugins,
  getServerServices: {
    serviceAttachments: ServiceAttachments,
    serviceAttachmentContents: ServiceAttachmentContents,
  },
  getServerMockServices: {
    serviceAttachments: ServiceAttachmentsMock,
    serviceAttachmentContents: ServiceAttachmentContentsMock,
  },
});
