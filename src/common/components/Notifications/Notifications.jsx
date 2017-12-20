import React, { Component } from 'react';
import PropTypes from 'prop-types';

import bemDecorator from '../../utils/decorators/bem-component';
import { generateId } from '../../utils/common';
import NoticeEmitter from '../../helpers/notifications';

import Notice from './Notice';

import './Notifications.css';

@bemDecorator({ componentName: 'Notifications', wrapper: false })
export default class Notifications extends Component {
  static propTypes = {
    NoticeComponent: PropTypes.func,
  };

  static defaultProps = {
    NoticeComponent: Notice,
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

  addNotice = (noticeData) => {
    const { notices } = this.state;
    notices.push({
      id: generateId(),
      ...noticeData,
    });
    this.setState({ notices });
  };

  removeNotice = (id) => {
    this.setState({
      notices: this.state.notices.filter((notice) => notice.id !== id),
    });
  };

  render() {
    const { NoticeComponent } = this.props;
    const { notices } = this.state;

    return (
      <div className={ this.fullClassName }>
        {notices.map((noticeData) =>
          React.createElement(NoticeComponent, {
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
