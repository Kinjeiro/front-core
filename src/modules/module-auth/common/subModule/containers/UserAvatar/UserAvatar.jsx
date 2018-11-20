/* eslint-disable no-return-assign */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import { getUserAvatarUrl } from '../../redux-user-info';
import {
  getUserId,
  getUserInfo,
} from '../../redux-selectors';

import './UserAvatar.css';

@connect(
  (globalState) => ({
    currentUserId: getUserId(globalState),
    currentAvatarKey: getUserInfo(globalState).avatarKey,
  }),
)
export default class UserAvatar extends PureComponent {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    userId: PropTypes.string,
    className: PropTypes.string,
    avatarKey: PropTypes.any,

    // ======================================================
    // @connect
    // ======================================================
    currentUserId: PropTypes.string,
    currentAvatarKey: PropTypes.any,
  };

  domElement = null;

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handle404Image(/* event */) {
    // event.targer.classList.add('UserAvatar--noAvatar');
    this.domElement.classList.add('UserAvatar--noAvatar');
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      userId,
      className,
      avatarKey,
      currentUserId,
      currentAvatarKey,
    } = this.props;

    const avatarKeyFinal = avatarKey || (userId === currentUserId ? currentAvatarKey : null);

    /*
    Основная проблема: как подсунуть дефолтную картинку, если аватарки нет

    1) onerror для img с протавление src

    2) рецепт использовать object + css а не img https://stackoverflow.com/a/32928240/344172
     пример - https://codepen.io/anon/pen/xwqJKQ.

     <object
     className="UserAvatar__image"
     data={ getUserAvatarUrl(username || currentUserId, avatarKeyFinal) }
     type="image/jpeg"
     />

     - не растягивается если нет изображение after на 100%
    */

    return (userId || currentUserId) && (
      <div
        ref={ (domElement) => this.domElement = domElement }
        key={ avatarKeyFinal }
        className={ `UserAvatar ${className || ''}` }
      >
        <img
          className="UserAvatar__image"
          src={ getUserAvatarUrl(userId || currentUserId, avatarKeyFinal) }
          alt={ `${userId}'s avatar` }
          onError={ this.handle404Image }
        />
      </div>
    );
  }
}
