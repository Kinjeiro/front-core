import EventEmitter from 'wolfy87-eventemitter';

import i18n from '../utils/i18n-utils';
import { generateId } from '../utils/common';

import clientConfig from '../client-config';

/*
export default class Notification extends Component {
  state = {
    notices: []
  };

  componentDidMount() {
    NoticeEmitter.addListener(this.addNotice);
    NoticeEmitter.resolveQueue();
  }

  componentWillUnmount() {
    NoticeEmitter.removeListener(this.addNotice);
  }

  addNotice = (noticeData, isRemove = false) => {
    const { notices } = this.state;

    if (isRemove) {
      notices = notices.filter(({ id }) => id !== noticeData.id)
    } else {
      notices.push(noticeData);
    }

    this.setState({ notices });
  };

  removeNotice = (id) => {
    this.setState({
      notices: this.state.notices.filter((notice) => notice.id !== id)
    });
  };

  render() {
    return (
      <div>
        {this.state.notices.map((noticeData) => (
          <Notice
            key={ noticeData.id }
            { ...noticeData }

            onClose={ this.removeNotice }
          />
        ))}
      </div>
    );
  }
}
*/

export class NoticeEmitter extends EventEmitter {
  EVENT_NAME = 'app-notification';

  STATUSES = {
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
  };

  noticeQueue = [];

  addListener(handler) {
    super.addListener(this.EVENT_NAME, handler);
  }

  removeListener(handler) {
    super.removeListener(this.EVENT_NAME, handler);
  }

  resolveQueue() {
    while (this.noticeQueue.length > 0) {
      this.emitEvent(this.EVENT_NAME, [this.noticeQueue.shift()]);
    }
  }

  emitNotify(...args) {
    // делаем с задержкой, чтобы компоненты отображающие смогли применить свои setState
    setTimeout(() => {
      this.emitEvent(this.EVENT_NAME, args);
    }, 10);
  }

  // todo @ANKU @CRIT @MAIN - typescript описать формат
  notify(messages, options = {}) {
    if (!Array.isArray(messages)) {
      // eslint-disable-next-line no-param-reassign
      messages = messages ? [messages] : [i18n('core:errors.clientErrorMessageDefault')];
    }

    const notice = {
      messages,
      ...options,
      // title,
      // icon,
      // status,
      id: options.id || generateId(),
      status: options.status || this.STATUSES.ERROR,
    };

    if (this.getListeners(this.EVENT_NAME).length > 0) {
      // если подключился компонент для отображения
      this.emitNotify(notice);
    } else if (clientConfig.common.features.notifications && clientConfig.common.features.notifications.systemQueue) {
      // копим, пока не подключится компонент, который будет все показывать
      this.noticeQueue.push(notice);
    }
  }


  // ======================================================
  // API
  // ======================================================
  error(messages, options = {}) {
    this.notify(messages, {
      ...options,
      status: this.STATUSES.ERROR,
    });
  }
  success(messages, options = {}) {
    this.notify(messages, {
      ...options,
      status: this.STATUSES.SUCCESS,
    });
  }
  info(messages, options = {}) {
    this.notify(messages, {
      ...options,
      status: this.STATUSES.INFO,
    });
  }
  warn(messages, options = {}) {
    this.notify(messages, {
      ...options,
      status: this.STATUSES.WARNING,
    });
  }

  removeNotice(id) {
    if (this.getListeners(this.EVENT_NAME).length > 0) {
      // если подключился компонент для отображения
      this.emitNotify({ id }, true);
    } else if (clientConfig.common.features.notifications && clientConfig.common.features.notifications.systemQueue) {
      // копим, пока не подключится компонент, который будет все показывать
      this.noticeQueue = this.noticeQueue.filter(({ id: itemId }) => itemId !== id);
    }
  }
}

const emitter = new NoticeEmitter();

export const STATUSES = emitter.STATUSES;
export const notify = emitter.notify.bind(emitter);
export const notifySuccess = emitter.success.bind(emitter);
export const notifyInfo = emitter.info.bind(emitter);
export const notifyWarn = emitter.warn.bind(emitter);
export const notifyError = emitter.error.bind(emitter);
export const removeNotice = emitter.removeNotice.bind(emitter);

export default emitter;
