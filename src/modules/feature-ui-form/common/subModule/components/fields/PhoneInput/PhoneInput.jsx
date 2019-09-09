import React from 'react';
import InputMask from 'react-input-mask';

export default class PhoneInput extends React.Component {
  render() {
    // todo @ANKU @LOW - адаптировать
    return (
      <InputMask
        mask="+7-999-999-99-99"
        permanents={ [0, 1, 2, 6, 9] }
        { ...this.props }
      />
    );
  }
}
