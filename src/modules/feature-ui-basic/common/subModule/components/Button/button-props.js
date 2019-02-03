import PropTypes from 'prop-types';
import STATUS_PROP_TYPE from '../../../../../../common/models/model-action-status';

export default {
  as: PropTypes.any,
  className: PropTypes.string,
  children: PropTypes.node,

  /**
   * default "button" (not "submit")
   */
  type: PropTypes.string,
  simple: PropTypes.bool,
  primary: PropTypes.bool,
  loading: PropTypes.oneOfType([
    PropTypes.bool,
    STATUS_PROP_TYPE,
  ]),
  disabled: PropTypes.bool,

  /**
   * Эмуляция кнопки (к примеру, выглядит label оборачивает input type="file" и выглядит как кнопка)
   */
  notNaturalButton: PropTypes.bool,

  /**
   * (default: true) показывать лоадинг если onClick возвращает promise
   */
  asyncIsLoading: PropTypes.bool,

  onClick: PropTypes.func,
  onClickArgs: PropTypes.any,
};
