import React from 'react';
import InputMask from 'react-input-mask';

// todo @ANKU @LOW - разбить на отображение и логику
export default class PhoneInput extends React.Component {
  // todo @ANKU @CRIT @MAIN -
  // static validate(value, fieldProps, domRef, getFormData) {
  //   return [];
  // }

  render() {
    const {
      pattern, // - убираем, так как не подходит - нужна маска
      onTouch,
      isProcessing,
      touched,
      controlRef,
      ...other
    } = this.props;
    // todo @ANKU @LOW - адаптировать
    return (
      <InputMask
        mask="+7-999-999-99-99"
        permanents={ [0, 1, 2, 6, 9] }
        { ...other }
      />
    );
  }
}
