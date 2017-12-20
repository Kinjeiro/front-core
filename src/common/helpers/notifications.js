import EventEmitter from 'wolfy87-eventemitter';

import clientConfig from '../client-config';
import i18n from '../utils/i18n-utils';


/**

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

  addNotice = (noticeData) => {
    const { notices } = this.state;
    notices.push({
      id: uuid.v4(),
      ...noticeData
    });
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

class NoticeEmitter extends EventEmitter {
  EVENT_NAME = 'app-notification';

  STATUSES = {
    OK: 'ok',
    FAIL: 'fail',
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

  // todo @ANKU @CRIT @MAIN - typescript описать формат
  notify(message = i18n('core:Произошла ошибка'), { title, icon, status = this.STATUSES.ERROR } = {}) {
    if (this.getListeners(this.EVENT_NAME).length > 0) {
      // если подключился компонент для отображения
      this.emitEvent(this.EVENT_NAME, [{ message, title, icon, status }]);
    } else if (clientConfig.common.features.notifications && clientConfig.common.features.notifications.systemQueue) {
      // копим, пока не подключится компонент, который будет все показывать
      this.noticeQueue.push({ message, title, icon, status });
    }
  }


  // ======================================================
  // API
  // ======================================================
  error(message, options = {}) {
    this.notify(message, {
      ...options,
      status: this.STATUSES.ERROR,
    });
  }
  info(message, options = {}) {
    this.notify(message, {
      ...options,
      status: this.STATUSES.OK,
    });
  }
  warn(message, options = {}) {
    this.notify(message, {
      ...options,
      status: this.STATUSES.FAIL,
    });
  }
}

const emitter = new NoticeEmitter();

export const notify = emitter.notify.bind(emitter);
export const notifyInfo = emitter.info.bind(emitter);
export const notifyWarn = emitter.warn.bind(emitter);
export const notifyError = emitter.error.bind(emitter);

export default emitter;
