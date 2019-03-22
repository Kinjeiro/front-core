/* eslint-disable max-len */
module.exports = {
  components: {
    CoreForm: {
      textActionSubmit: 'Отправить',
      textActionCancel: 'Отмена',
      textDefaultFormErrorText: 'Некорректные данные',
    },
    CoreField: {
      errors: {
        requiredError: 'Поле "{{fieldName}}" обязательно к заполнению.',
        multipleMinSize: 'Поле "{{fieldName}}" должно содержать не менее {{multipleMinSize}} значений.',
        multipleMaxSize: 'Поле "{{fieldName}}" не должно содержать более {{multipleMaxSize}} значений.',
      },
    },

    CoreSelect: {
      placeholder: 'Выберите значение...',
    },

    Attachment: {
      dropThere: 'Перетащите сюда файлы',
      addButton: 'Добавить файл',
    },
  },
};
