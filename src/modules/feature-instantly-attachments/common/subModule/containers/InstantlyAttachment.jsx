import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import { wrapToArray } from '../../../../../common/utils/common';


// ======================================================
// MODULE
// ======================================================
import { actions } from '../redux-attachments';
import {
  generateAttachmentUuid,
  getAttachmentsByFieldId,
} from '../redux-selectors-attachments';
import {
  ATTACHMENT_PROP_TYPE,
  normalizeAttachment,
} from '../model-attachment';

import getComponents from '../get-components';

const {
  Attachment,
} = getComponents();

/**
 * класс который поддерживает мгновенную загрузку аттачментов и хранение инфы об этом в редуксе
 */
@connect(
  (globalState, { id }) => ({
    attachmentsMap: getAttachmentsByFieldId(globalState, id),
  }),
  {
    ...actions,
  },
)
export default class InstantlyAttachment extends Component {
  static propTypes = {
    /*
     id
     parseValue
     onAdd
     value,
     */
    ...Attachment.propTypes,

    // ======================================================
    // connect
    // ======================================================
    attachmentsMap: PropTypes.objectOf(ATTACHMENT_PROP_TYPE),
    actionGetAttachmentInfo: PropTypes.func,
    actionDownloadAttachment: PropTypes.func,
    actionUploadAttach: PropTypes.func,
    actionClearAttachment: PropTypes.func,
    actionDeleteAttach: PropTypes.func,
  };

  // ======================================================
  // STATIC
  // ======================================================
  static isEmptyValue(type, value = null, props = {}) {
    return !value || !value.downloadUrl;
  }

  // ======================================================
  // UTILS
  // ======================================================
  updateValue(value, props = this.props) {
    const {
      attachmentsMap,
    } = props;

    const additional = value ? attachmentsMap[value.uuid] : null;
    return additional
      ? {
        ...value,
        ...additional,
        preview: additional.preview || value.preview,
      }
      : value;
  }

  /**
   * Наполняем результаты из рудекса (сколько загружено)
   * @return {*}
   */
  updateValues() {
    const {
      value,
    } = this.props;

    const valueFinal = normalizeAttachment(value);

    return Array.isArray(valueFinal)
      ? valueFinal.map((valueItem) => this.updateValue(valueItem))
      : this.updateValue(valueFinal);
  }

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  componentWillReceiveProps(newProps) {
    const {
      onChange,
      attachmentsMap,
      value,
      warnings,
      onWarnings,
      multiple,
      actionClearAttachment,
    } = newProps;

    Object.keys(attachmentsMap).forEach((key) => {
      const attach = attachmentsMap[key];
      const old = this.props.attachmentsMap[key];

      if (attach && attach.isNew === false && (!old || old.isNew)) {
        // когда загрузился аттач на сервер

        let valueIndex = null;
        const newValues = wrapToArray(value).map((valueItem, index) => {
          if (valueItem.uuid === attach.uuid) {
            valueIndex = index;
            return {
              ...valueItem,
              ...attach,
              // обновляем превью
              preview: attach.preview || valueItem.preview,
            };
          }
          return valueItem;
        });

        // записываем его значение внутрь какой-нибудь формы
        onChange(multiple ? newValues : newValues[0], valueIndex);

        // а сам аттачмент удаляем из общего хранилища аттачей - он загрузился и хранится теперь в форме
        actionClearAttachment(attach.uuid);

        // если есть варнинги нужно их пробросить, так как старые затруться после onChange
        if (warnings && warnings.length) {
          // таймаут чтобы сбросились старые в onChange
          setTimeout(() => onWarnings(warnings), 10);
        }
      }
    });
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  parseValueFromFile(file) {
    const {
      id,
      parseValue,
    } = this.props;

    return {
      ...(parseValue ? parseValue(file) : {}),
      uuid: generateAttachmentUuid(id),
    };
  }

  @bind()
  handleAdd(newFilesMap, newAttachments, resultAttachments) {
    const {
      onAdd,
      actionUploadAttach,
    } = this.props;

    let newFileMapFinal = newFilesMap;
    if (newFileMapFinal instanceof File) {
      // multiple: false
      newFileMapFinal = {
        [newAttachments[0].uuid]: newFileMapFinal,
      };
    }

    if (onAdd) {
      onAdd(newFileMapFinal, newAttachments, resultAttachments);
    }

    return Promise.all(
      Object.keys(newFileMapFinal).map((uuid) =>
          actionUploadAttach(uuid, newFileMapFinal[uuid])));
  }

  @bind()
  handleRemove(attachment, resultValues) {
    const {
      onRemove,
      actionClearAttachment,
    } = this.props;

    if (typeof attachment.uuid !== 'undefined') {
      actionClearAttachment(attachment.uuid);
    }

    if (onRemove) {
      onRemove(attachment, resultValues);
    }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      attachmentsMap,
      actionGetAttachmentInfo,
      actionDownloadAttachment,
      actionUploadAttach,
      actionUploadingChange,
      actionClearAttachment,
      actionDeleteAttach,
      ...attachmentProps
    } = this.props;
    return (
      <Attachment
        { ...attachmentProps }
        value={ this.updateValues() }
        parseValue={ this.parseValueFromFile }

        onAdd={ this.handleAdd }
        onRemove={ this.handleRemove }
      />
    );
  }
}

