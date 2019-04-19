import PropTypes from 'prop-types';

import { objectValues } from '../../../../common/utils/common';

export const COLUMN_TYPES = {
  CHECKBOX: 'checkbox',
  EXPAND: 'expand',

  TEXT: 'text',
  DATE: 'date',
  DATETIME: 'datetime',
  NUMBER: 'number',
  DECIMAL: 'decimal',
  CODE: 'code',
};

export const COLUMN_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    dataIndex: PropTypes.string,
    type: PropTypes.oneOf(objectValues(COLUMN_TYPES)),
    key: PropTypes.string,
    title: PropTypes.node,
    /**
     * (cellValue, column, record, rowIndex) => {}
     */
    render: PropTypes.func,
    className: PropTypes.string,
    headerCellProps: PropTypes.object,
    cellProps: PropTypes.object,
    /**
     * Оборачивает значение колонки в линку
     * если функция - (record, column, rowIndex) => {}
     */
    linkTo: PropTypes.oneOf([
      PropTypes.func,
      PropTypes.object,
      PropTypes.string,
    ]),
  }),
]);

export default COLUMN_PROP_TYPE;
