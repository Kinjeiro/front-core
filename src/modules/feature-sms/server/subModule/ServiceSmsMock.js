import { generateNumberId } from '../../../../common/utils/common';
import CoreServiceMock from '../../../../server/services/utils/CoreServiceMock';

export default class ServiceSmsMock extends CoreServiceMock {
  generateCode() {
    return generateNumberId(4);
  }

  generateMessage(message, code = this.generateCode()) {
    return `${message} ${code}`;
  }

  async sendSms(phoneNumber, smsText) {
    return smsText;
  }
}
