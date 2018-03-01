import React, { Component } from 'react';
import PropTypes from 'prop-types';

import bemDecorator from '../../utils/decorators/bem-component';
import NoticeEmitter from '../../helpers/notifications';

import Notice from './Notice';

import './Notifications.css';

@bemDecorator({ componentName: 'Notifications', wrapper: false })
export default class Notifications extends Component {
  static propTypes = {
    NoticeComponentClass: PropTypes.oneOfType([
      PropTypes.instanceOf(Component),
      PropTypes.func,
    ]),
  };

  static defaultProps = {
    NoticeComponentClass: Notice,
  };

  state = {
    notices: [],
  };

  componentDidMount() {
    NoticeEmitter.addListener(this.addNotice);
    NoticeEmitter.resolveQueue();
  }

  componentWillUnmount() {
    NoticeEmitter.removeListener(this.addNotice);
  }

  addNotice = (noticeData, isRemove = false) => {
    if (isRemove) {
      this.removeNotice(noticeData.id);
    } else {
      this.setState({
        notices: [...this.state.notices, noticeData],
      });
    }
  };

  removeNotice = (id) => {
    this.setState({
      notices: this.state.notices.filter((notice) => notice.id !== id),
    });
  };

  render() {
    const { NoticeComponentClass } = this.props;
    const { notices } = this.state;

    return (
      <div className={ this.fullClassName }>
        {notices.map((noticeData) =>
          React.createElement(NoticeComponentClass, {
            key: noticeData.id,
            className: this.bem('notice'),
            ...noticeData,
            onClose: this.removeNotice,
          }),
        )}
      </div>
    );
  }
}
