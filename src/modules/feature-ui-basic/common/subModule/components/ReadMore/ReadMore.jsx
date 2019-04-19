import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import bind from 'lodash-decorators/bind';

import i18n from '../../i18n';

export default class ReadMore extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    text: PropTypes.node,
    lines: PropTypes.number,
    more: PropTypes.node,
    less: PropTypes.node,
  };

  static defaultProps = {
    lines: 3,
    more: i18n('components.ReadMore.more'),
  };

  state = {
    expanded: false,
    truncated: false,
  };

  @bind()
  handleTruncate(truncated) {
    if (this.state.truncated !== truncated) {
      this.setState({
        truncated,
      });
    }
  }

  @bind()
  toggleLines(event) {
    event.preventDefault();

    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const {
      children,
      more,
      less,
      lines,
    } = this.props;

    const {
      expanded,
      truncated,
    } = this.state;

    return (
      <div>
        <Truncate
          lines={ !expanded && lines }
          ellipsis={ (
            <span>... <a
              href="#"
              onClick={ this.toggleLines }
            >{more}</a>
            </span>
          ) }
          onTruncate={ this.handleTruncate }
        >
          {children}
        </Truncate>
        { less && !truncated && expanded && (
          <span>
            <a
              href="#"
              onClick={ this.toggleLines }
            >
              {less}
            </a>
          </span>
        )}
      </div>
    );
  }
}
