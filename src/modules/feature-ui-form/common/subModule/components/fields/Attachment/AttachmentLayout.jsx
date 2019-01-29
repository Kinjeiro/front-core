import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class AttachmentLayout extends PureComponent {
  static propTypes = {
    className: PropTypes.string,

    label: PropTypes.node,
    attachments: PropTypes.node,
    uploadControl: PropTypes.node,
    afterContent: PropTypes.node,
  };

  render() {
    const {
      className,
      label,
      attachments,
      uploadControl,
      afterContent,
    } = this.props;

    return (
      <div className={ className }>
        { label }
        { attachments }
        { uploadControl }
        { afterContent }
      </div>
    );
  }
}
