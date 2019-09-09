import { apiPluginFactory } from '../../../../server/utils/api-plugin-factory';
import { setCookie } from '../../../../server/utils/hapi-utils';
import serverLogger from '../../../../server/helpers/server-logger';
import serverConfig from '../../../../server/server-config';

import { COOKIE__VERIFY_TOKEN } from '../../../module-auth/server/subModule/users/server-api-users';

import { API_CONFIGS } from '../../common/subModule/api-sms';

export default function getServerApi() {
  return [
    apiPluginFactory(
      API_CONFIGS.apiSendSmsCode,
      async (requestData, request, reply) => {
        const {
          services: {
            serviceUsers,
            serviceSms,
          },
        } = request;
        const {
          userIdentify,
          phone,
          preCodeText,
        } = requestData;
        serverLogger.log('apiSendSmsCode', phone);

        const smsCode = serviceSms.generateCode();
        // const smsText = `Kod dla podtvergdenia registracii LK: ${smsCode}`;
        const smsText = serviceSms.generateMessage(preCodeText, smsCode);

        const user = userIdentify && await serviceUsers.findUser(userIdentify);

        try {
          await serviceSms.sendSms(phone, smsText);
        } catch (error) {
          // todo @ANKU @CRIT @MAIN - отключил ошибки от sms пока нету гейта
          serverLogger.error(error);
        }

        if (user) {
          console.warn('ANKU , user', smsCode);
          await serviceUsers.setVerifyToken(user.userId, smsCode);
        } else {
          const hash = serviceUsers.hashVerifyToken(smsCode);
          setCookie(reply, COOKIE__VERIFY_TOKEN, hash);
        }

        // todo @ANKU @CRIT @MAIN @debugger - пока отключили пока проблема с смс гейтом
        if (serverConfig.common.env !== 'production') {
          return reply(smsCode);
        }

        return reply();
      },
      {
        routeConfig: {
          // для этого обработчика авторизация не нужна
          auth: false,
        },
      },
    ),
  ];
}
