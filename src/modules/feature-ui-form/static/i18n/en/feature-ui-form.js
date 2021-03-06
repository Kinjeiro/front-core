/* eslint-disable max-len */
module.exports = {
  components: {
    CoreForm: {
      textActionSubmit: 'Send',
      textActionCancel: 'Cancel',
      textDefaultFormErrorText: 'Form has errors',
    },
    CoreField: {
      errors: {
        requiredErrorWithoutFieldName: 'Field is required.',
        requiredError: 'Field "{{fieldName}}" is required.',
        multipleMinSize: 'Field "{{fieldName}}" must contains at least {{multipleMinSize}} values.',
        multipleMaxSize: 'Field "{{fieldName}}" must contains no more than {{multipleMaxSize}} values.',
      },
    },

    SelectCore: {
      placeholder: 'Choice option...',
    },

    Attachment: {
      dropThere: 'Drop files here or click to upload',
      addButton: 'Add file',
    },
  },
};
