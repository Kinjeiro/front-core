import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class AttachmentItemLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    description: PropTypes.node,
    attachmentDetails: PropTypes.node,
    removeButton: PropTypes.node,
    preview: PropTypes.node,
  };

  render() {
    const {
      className,
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
