import PropTypes from 'prop-types';

import NoticeEmitter from '../../../../../../common/helpers/notifications';

const STATUSES = NoticeEmitter.STATUSES;

export const defaultProps = {
  status: STATUSES.ERROR,
};

export default {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  messages: PropTypes.arrayOf(PropTypes.string),
  icon: PropTypes.element,

  status: PropTypes.oneOf([STATUSES.SUCCESS, STATUSES.WARNING, STATUSES.ERROR]),
  autoCloseDelay: PropTypes.number,

  // todo @ANKU @CRIT @MAIN - если нужно будет - подключим этот функционал
  // onApply: PropTypes.func,
  // onApplyText: PropTypes.string,
  // onCancel: PropTypes.func,
  // onCancelText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

