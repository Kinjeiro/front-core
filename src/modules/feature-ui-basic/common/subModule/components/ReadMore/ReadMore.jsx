import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import bind from 'lodash-decorators/bind';

import i18n from '../../i18n';

import getComponents from '../../get-components';

const {
  Button,
} = getComponents();

export default class ReadMore extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    text: PropTypes.node,
    lines: PropTypes.number,
    more: PropTypes.node,
    less: PropTypes.node,
    onChangeStatus: PropTypes.func,
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
    const {
      onChangeStatus,
    } = this.props;

    event.preventDefault();
    event.stopPropagation();

    const expandedNew = !this.state.expanded;
    this.setState({
      expanded: expandedNew,
    });

    return onChangeStatus && onChangeStatus(expandedNew);
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
            <span>... <Button
              asLink={ true }
              onClick={ this.toggleLines }
            >{more}</Button>
            </span>
          ) }
          onTruncate={ this.handleTruncate }
        >
          {children}
        </Truncate>

        { less && !truncated && expanded && (
          <span>
            <Button
              asLink={ true }
              onClick={ this.toggleLines }
            >
              {less}
            </Button>
          </span>
        )}
      </div>
    );
  }
}
