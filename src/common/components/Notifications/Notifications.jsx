import React, { Component } from 'react';
import PropTypes from 'prop-types';

import bemDecorator from '../../utils/decorators/bem-component';
import NoticeEmitter from '../../helpers/notifications';

import componentsBase from '../ComponentsBase';

import './Notifications.css';

const { Notice } =  componentsBase;

@bemDecorator({ componentName: 'Notifications', wrapper: false })
export default class Notifications extends Component {
  static propTypes = {
  };

  static defaultProps = {
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
    const { notices } = this.state;

    return (
      <div className={ this.fullClassName }>
        {
          notices.map((noticeData) => (
            <Notice
              key={ noticeData.id }
              className={ this.bem('notice') }
              { ...noticeData }
              onClose={ this.removeNotice }
            />
          ))
        }
      </div>
    );
  }
}
