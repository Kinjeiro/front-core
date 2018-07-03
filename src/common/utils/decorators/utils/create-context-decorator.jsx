import React from 'react';

export default function createContextDecorator(ContextConsumer) {
  return (otherProps = {}) => (ReactComponentClass) => (props) => (
    <ContextConsumer>
      {
        (contextData) => (
          <ReactComponentClass
            { ...props }
            { ...contextData }
            { ...otherProps }
          />
        )
      }
    </ContextConsumer>
  );
}
