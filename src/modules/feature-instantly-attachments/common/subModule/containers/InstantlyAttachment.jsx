import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';
import memoizeOne from 'memoize-one';

import clientConfig from '../../../../../common/client-config';
import getApiClient from '../../../../../common/helpers/get-api-client';

import { wrapToArray } from '../../../../../common/utils/common';


// ======================================================
// MODULE
// ======================================================
import { actions } from '../redux-attachments';
import {
  generateAttachmentUuid,
  getAttachmentInfosByUuids,
  getAttachmentIsSummaryFetching,
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
  (globalState, { id, editable, onChangeStatus, value }) => {
    return {
      attachmentsInfoMap: editable === false ? undefined : getAttachmentInfosByUuids(globalState, value) ,
      isSummaryFetching: editable === false ? undefined : getAttachmentIsSummaryFetching(globalState, value),
    }
  },
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
    /**
     * (isSummaryFetching) => {} - если один из атачей всего контрола имеет процесс
     */
    onChangeStatus: PropTypes.func,

    // ======================================================
    // connect
    // ======================================================
    actionGetAttachmentInfo: PropTypes.func,
    actionDownloadAttachment: PropTypes.func,
    actionUploadAttach: PropTypes.func,
    actionClearAttachment: PropTypes.func,
    actionDeleteAttach: PropTypes.func,
    attachmentsInfoMap: PropTypes.object,
  };

  static defaultProps = {
    ...Attachment.defaultProps,
    id: Math.random(),
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
  updateValue(value, attachmentsInfoMap = undefined) {
    const additional = value && attachmentsInfoMap ? attachmentsInfoMap[value.uuid || value.id] : null;
    return additional
      ? {
        ...value,
        ...additional.data,
        preview: additional.data.preview || value.preview,
      }
      : value;
  }

  /**
   * Наполняем результаты из рудекса (сколько загружено)
   * @return {*}
   */
  updateValues = memoizeOne(
    (attachmentsInfoMap, value) => {
      const valueFinal = normalizeAttachment(value);

      return Array.isArray(valueFinal)
        ? valueFinal.map((valueItem) => this.updateValue(valueItem, attachmentsInfoMap))
        : this.updateValue(valueFinal);
    }
  );

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {
      editable,
      value,
    } = nextProps;

    return editable || value !== this.props.value;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      onChange,
      value,
      warnings,
      onWarnings,
      multiple,
      actionClearAttachment,

      attachmentsInfoMap = {},
      isSummaryFetching,
      onChangeStatus,
    } = this.props;

    Object.keys(attachmentsInfoMap).forEach((key) => {
      const {
        data: attachItem,
      } = attachmentsInfoMap[key];
      const {
        data: attachItemPrev,
      } = prevProps.attachmentsInfoMap[key] || {};

      if (
        attachItem && attachItem.isNew === false && (!attachItemPrev || attachItemPrev.isNew) // изменился статус, он теперь загружен
      ) {
        // когда загрузился аттач на сервер

        let valueIndex = null;
        const newValues = wrapToArray(value).map((valueItem, index) => {
          if (valueItem.uuid === attachItem.uuid) {
            valueIndex = index;
            return {
              ...valueItem,
              ...attachItem,
              // обновляем превью
              preview: attachItem.preview || valueItem.preview,
            };
          }
          return valueItem;
        });

        // записываем его значение внутрь какой-нибудь формы
        if (onChange) {
          onChange(multiple ? newValues : newValues[0], valueIndex);

          // а сам аттачмент удаляем из общего хранилища аттачей - он загрузился и хранится теперь в форме
          actionClearAttachment(attachItem.uuid);
        }

        // если есть варнинги нужно их пробросить, так как старые затруться после onChange
        if (warnings && warnings.length) {
          // таймаут чтобы сбросились старые в onChange
          setTimeout(() => onWarnings(warnings), 10);
        }
      }
    });

    if (onChangeStatus && isSummaryFetching !== prevProps.isSummaryFetching) {
      onChangeStatus(isSummaryFetching);
    }
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
  handleAttachmentClick(attachment) {
    const {
      actionDownloadAttachment,
    } = this.props;
    const {
      id,
      downloadUrl,
      fileName,
    } = attachment;

    if (downloadUrl) {
      return getApiClient().downloadFile(downloadUrl, fileName);
    }
    return actionDownloadAttachment(id);
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
  async handleRemove(attachment, resultValues) {
    const {
      onRemove,
      actionClearAttachment,
      actionDeleteAttach,
    } = this.props;

    let stopPropagation = false;
    if (onRemove) {
      stopPropagation = await onRemove(attachment, resultValues);
    }

    if (!stopPropagation && clientConfig.common.features.attachments.useContentDeleteOnAttachmentDelete !== false) {
      await actionDeleteAttach(attachment.id);
    }

    if (typeof attachment.uuid !== 'undefined') {
      actionClearAttachment(attachment.uuid);
    }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      actionGetAttachmentInfo,
      actionDownloadAttachment,
      actionUploadAttach,
      actionUploadingChange,
      actionClearAttachment,
      actionDeleteAttach,

      attachmentsInfoMap,
      onChangeStatus,
      isSummaryFetching,

      isProcessing,
      value,

      ...attachmentProps
    } = this.props;
    return (
      <Attachment
        { ...attachmentProps }

        value={ this.updateValues(attachmentsInfoMap, value) }
        parseValue={ this.parseValueFromFile }

        onAdd={ this.handleAdd }
        onRemove={ this.handleRemove }
        onAttachmentClick={ this.handleAttachmentClick }

        isProcessing={ isProcessing || isSummaryFetching }
        attachmentsInfoMap={ attachmentsInfoMap }
        isSummaryFetching={ isSummaryFetching }
      />
    );
  }
}

