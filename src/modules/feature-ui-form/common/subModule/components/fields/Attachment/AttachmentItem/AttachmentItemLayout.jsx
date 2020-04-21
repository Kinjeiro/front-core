import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ATTACHMENT_PROP_TYPE from '../../../../model-attachment';

export default class AttachmentItemLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    attachment: ATTACHMENT_PROP_TYPE,

    description: PropTypes.node,
    attachmentDetails: PropTypes.node,
    removeButton: PropTypes.node,
    preview: PropTypes.node,
  };

  render() {
    const {
      className,
      attachment,
      description,
      attachmentDetails,
      removeButton,
      preview,
    } = this.props;

    return (
      <div className={ className }>
        { attachmentDetails }
        { removeButton }
        { preview }
        { description }
      </div>
    );
  }
}
