import React, { Component } from 'react';
import PropTypes from 'prop-types';

import i18n from '../../utils/i18n-utils';


export const DEFAULT_THEME = 'default-theme';

/**
 * Компонент задающий тему для своих дочерних компонентов.
 * Важно! Может содержать в себе строго один дочерний компонент.
 */
export default class ThemeProvider extends Component {
  static DEFAULT_THEME = DEFAULT_THEME;

  static propTypes = {
    children: PropTypes.node,
    /** Тема компонента */
    theme: PropTypes.string,
    /** Дополнительный класс */
    className: PropTypes.string,
  };

  static defaultProps = {
    theme: DEFAULT_THEME,
  };

  // static contextTypes = {
  //  theme: PropTypes.string
  // };

  static childContextTypes = {
    theme: PropTypes.string,
  };

  getChildContext() {
    return {
      theme: this.props.theme,
    };
  }

  render() {
    const {
      children,
      theme,
      className,
    } = this.props;

    if (children && children.length > 1) {
      throw new Error(i18n('core:You can provide only one child element to <ThemeProvider />'));
    }

    // return this.props.children && React.cloneElement(this.props.children);
    return (
      <div className={ `${className || ''} ${theme}` }>
        { children }
      </div>
    );
  }
}
