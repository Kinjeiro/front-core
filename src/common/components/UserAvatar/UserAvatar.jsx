import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { getUserAvatarUrl } from '../../app-redux/reducers/app/users';

import './UserAvatar.css';

export default class UserAvatar extends PureComponent {
  static propTypes = {
    username: PropTypes.string,
    className: PropTypes.string,
  };

  render() {
    const {
      username,
      className,
      ...otherProps
    } = this.props;

    /*
    Основная проблема: как подсунуть дефолтную картинку, если аватарки нет

    1) onerror для img с протавление src

    2) рецепт использовать object + css а не img https://stackoverflow.com/a/32928240/344172
     пример - https://codepen.io/anon/pen/xwqJKQ
    */
    return (
      <object
        data={ getUserAvatarUrl(username) }
        type="image/jpeg"
        { ...otherProps }
        className={ `UserAvatar ${className || ''}` }
      />
    );
  }
}
