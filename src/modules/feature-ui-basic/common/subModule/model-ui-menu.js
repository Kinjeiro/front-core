import PropTypes from 'prop-types';
import {
  objectValues,
} from '../../../../common/utils/common';

export const MENU_ITEM_TYPE = {
  NORMAL: 'normal',
  DELIMITER: 'delimiter',
  HEADER: 'header',
};

export const MENU_ITEM_PROP_TYPE_MAP = {
  // остальные проперти - https://react.semantic-ui.com/modules/dropdown#content-label
  // или тут примеры - https://github.com/Semantic-Org/Semantic-UI-React/blob/master/docs/src/examples/modules/Dropdown/common.js
  // as
  // value
  // description
  // label={{ color: 'red', empty: true, circular: true }}
  // image: { avatar: true, src: '/images/avatar/small/elliot.jpg' },

  /**
   MENU_ITEM_TYPE = {
        NORMAL: 'normal',
        DELIMITER: 'delimiter',
        HEADER: 'header',
      }
   */
  type: PropTypes.oneOf(objectValues(MENU_ITEM_TYPE)),
  name: PropTypes.node,
  icon: PropTypes.string,
  /**
   * url аватарки
   * либо будет использована icon
   */
  image: PropTypes.string,
  path: PropTypes.any,
  /**
   * либо name будет рисоваться
   */
  content: PropTypes.node,
  /**
   * true - показывать только для мобильных
   * false - показывать только для не мобильных
   * undefined \ null - показывать везде
   */
  mobile: PropTypes.bool,
  /**
   * либо path будет использован для перехода
   */
  onClick: PropTypes.func,
  /**
   * по умолчанию, если есть path или onClick то считается линкой, но это можно исправить с помощью этого параметра
   */
  isLink: PropTypes.bool,
};

export const MENU_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.arrayOf(PropTypes.shape(MENU_ITEM_PROP_TYPE_MAP)),
]);

export default MENU_PROP_TYPE;
