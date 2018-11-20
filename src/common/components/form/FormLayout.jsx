import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../utils/i18n';

import './FormLayout.css';

const ELEMENT_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node),
]);

export default class FormLayout extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    inModal: PropTypes.bool,

    fields: PropTypes.array,
    actions: ELEMENT_PROP_TYPE,
    postActions: ELEMENT_PROP_TYPE,
    actionStatus: PropTypes.object,
    formErrors: PropTypes.node,
  };

  renderElement(className, element) {
    const isNotEmpty = element && (!Array.isArray(element) || element.length > 0);
    return isNotEmpty
      ? (
        <div className={ className }>
          { element }
        </div>
      )
      : null;
  }

  render() {
    const {
      className,
      inModal,

      fields,
      actions,
      postActions,
      actionStatus,
      formErrors,
    } = this.props;

    return (
      <div className={ `FormLayout ${className || ''} ${inModal ? 'FormLayout--modal' : ''}` }>
        { this.renderElement('FormLayout__fields', fields) }
        { this.renderElement('FormLayout__actions', actions) }
        { this.renderElement('FormLayout__postActions', postActions) }
        { this.renderElement('FormLayout__actionStatus', actionStatus) }
        { this.renderElement('FormLayout__formErrors', formErrors) }
      </div>
    );
  }
}

