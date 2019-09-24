import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../../../../common/utils/decorators/react-class/redux-simple-form';

// ======================================================
// OTHER_MODULES
// ======================================================
import {
  FIELD_TYPES,
  FIELD_SUB_TYPES,
} from '../../../../../../feature-ui-form/common/subModule/model-field';

// ======================================================
// MODULE
// ======================================================
import getComponents from '../../../get-components';

const {
  Segment,
  Form,
  InstanceAttachment,
} = getComponents();

require('./TestForm.css');

export const PAGE_ID = 'TestForm';

@reduxSimpleForm(
  PAGE_ID,
  {
    name: null,
    attachments: [],
  },
)
export default class TestForm extends PureComponent {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    initValues: PropTypes.any,

    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.object,
    formId: PropTypes.string,
    onUpdateForm: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: (data) => {
      debugger;
    },
  };

  // ======================================================
  // RENDERS
  // ======================================================
  getFields() {
    const fields = [];
    fields.push(
      {
        name: 'string',
        label: 'Text "test"',
        type: Form.FIELD_TYPES.STRING,
        required: true,
        validate: (value) => (!value || value === 'test' || 'Кастомная ошибка'),
      },
      {
        name: 'string2',
        label: 'Required text',
        type: Form.FIELD_TYPES.STRING,
        required: true,
      },
      {
        name: 'numeric',
        label: 'numeric',
        type: Form.FIELD_TYPES.NUMERIC,
        constraints: {
          maxValue: 10,
        },
      },
      {
        name: 'text',
        lagel: 'text',
        type: Form.FIELD_TYPES.TEXT,
      },
      {
        label: 'LIST',
        name: 'list',
        type: Form.FIELD_TYPES.LIST,
        options: [
          {
            label: 'label 1',
            value: 'value 1',
          },
          {
            label: 'bbbb',
            value: 'bbbb',
          },
        ],
      },
      {
        name: 'datetime',
        label: 'datetime',
        type: Form.FIELD_TYPES.DATETIME,
      },
      {
        name: 'boolean',
        label: 'boolean',
        type: Form.FIELD_TYPES.BOOLEAN,
      },
      {
        name: 'name',
        label: 'name',
        required: true,
      },
      {
        name: 'attachmentsSingleSimple',
        label: 'attachmentsSingleSimple',
        type: FIELD_TYPES.BINARY,
        multiple: false,
      },
      {
        name: 'attachmentsSingle',
        label: 'attachmentsSingle',
        type: FIELD_TYPES.BINARY,
        multiple: false,
        required: true,
        controlProps: {
          accept: '.jpg, .jpeg',
          // addButtonText: 'Загрузить фотографии',
        },
        controlClass: InstanceAttachment,
      },
      {
        name: 'attachmentMultipleWithConditions',
        label: 'attachmentMultipleWithConditions',
        type: FIELD_TYPES.BINARY,
        multiple: true,
        required: true,
        constraints: {
          maxBytes: 200000,
          multipleMaxSize: 3,
          multipleMinSize: 2,
        },
        controlProps: {
          // accept: '.png, .jpg, .jpeg',
          acceptOnlyImages: true,
          addButtonText: 'Загрузить фотографии',
        },
        controlClass: InstanceAttachment,
      },
      {
        name: 'attachmentMultipleDoc',
        label: 'attachmentMultipleDoc',
        type: FIELD_TYPES.BINARY,
        multiple: true,
        required: false,
        constraints: {
        },
        controlProps: {
          withDescriptions: true,
          // accept: '.png, .jpg, .jpeg',
        },
        controlClass: InstanceAttachment,
      },
      {
        type: FIELD_TYPES.GROUPING,
        className: 'addressGroup',
        nodeBefore: (
          <h2>Заполнение адресс</h2>
        ),
        fields: [
          {
            name: 'address.country',
            label: 'country',
            required: true,
          },
          {
            type: FIELD_TYPES.GROUPING,
            fields: [
              {
                name: 'address.city',
                label: 'city',
                required: true,
              },
              {
                name: 'address.street',
                label: 'street',
                required: true,
              },
            ],
          },
          {
            type: FIELD_TYPES.GROUPING,
            fields: [
              {
                name: 'address.apartment',
                label: 'apartment',
                required: true,
              },
              {
                name: 'address.office',
                label: 'office',
              },
              {
                name: 'address.house',
                label: 'house',
              },
            ],
            renderGrouping: (groupingField, index, fieldCmps, fieldProps) => {
              return (
                <div>
                  <div>
                    Квартиры и офисы
                  </div>
                  <div>
                    { fieldCmps }
                  </div>
                  <div>
                    Выбрали квартиру: { fieldProps[0].value }
                  </div>
                </div>
              );
            },
          },
        ],
        nodeAfter: (
          <div>
            Спасибо за предоставленный данные... МУХАХА!
          </div>
        ),
      }
    );
    return fields;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      onUpdateForm,
      onSubmit,
      onCancel,
      form,
      formId,
    } = this.props;

    return (
      <Segment
        className="TestForm"
      >
        <Form
          id={ formId }

          fields={ this.getFields() }
          formData={ form }
          onUpdateForm={ onUpdateForm }

          onSubmit={ onSubmit }
          onCancel={ onCancel }
        />
      </Segment>
    );
  }
}
