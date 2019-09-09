import { generateNumberId } from '../../../../common/utils/common';
import CoreService from '../../../../server/services/utils/CoreService';

export default class ServiceSms extends CoreService {
  generateCode() {
    return generateNumberId(4);
  }

  generateMessage(message, code = this.generateCode()) {
    return `${message} ${code}`;
  }

  async sendSms(phoneNumber, smsText) {
    return this.sendWithAuth(
      '/sms/send',
      {
        // "needReadDeliveryReport": 0,
        phoneNumber,
        smsText,
        // "translit": 0
      },
      {
        method: 'POST',
      },
    );
  }
}
