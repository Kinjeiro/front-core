import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class UnescapedHtml extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    as: PropTypes.any,
    html: PropTypes.string,
  };

  render() {
    const {
      className,
      as,
      html,
    } = this.props;

    const isString = typeof html === 'string';

    if (!as && !isString && !className) {
      return html;
    }

    // eslint-disable-next-line react/no-danger-with-children
    return React.createElement(
      as || 'div',
      {
        className,
        dangerouslySetInnerHTML: isString
          ? {
            __html: html,
          }
          : undefined,
      },
      isString ? undefined : html,
    );
  }
}
