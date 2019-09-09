import SubModuleFactory from '../../../SubModuleFactory';

import getServerApi from './server-api-sms';
import ServiceSms from './ServiceSms';
import ServiceSmsMock from './ServiceSmsMock';

export default SubModuleFactory.createServerSubModule({
  getServerApi,
  getServerServices: (endpoints) => ({
    serviceSms: ServiceSms,
  }),
  getServerMockServices: () => ({
    serviceSms: ServiceSmsMock,
  }),
});
