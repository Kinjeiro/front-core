import React from 'react';

export default function asyncComponentWrapper(getComponent) {
  return class AsyncComponent extends React.Component {
    static Component = null;
    state = {
      Component: AsyncComponent.Component,
    };

    componentWillMount() {
      if (!this.state.Component) {
        getComponent()
          .then(Component => {
            AsyncComponent.Component = Component.default || Component;
            this.setState({
              Component: AsyncComponent.Component,
            });
          });
      }
    }
    render() {
      const { Component } = this.state;
      if (Component) {
        return <Component { ...this.props } />;
      }
      return null;
    }
  };
}
