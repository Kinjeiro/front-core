/* eslint-disable no-param-reassign */
import lodashGet from 'lodash/get';
import React from 'react';

import getComponents from '../../../get-components';

const {
  Loading: LoadingComponent,
} = getComponents();

function checkIsStatus(result) {
  return typeof result === 'object'
    && typeof result.isFetching !== 'undefined'
    && typeof result.isLoaded !== 'undefined';
}

export function checkLoading(loadingFn, componentContext, checkLoaded = false) {
  let isLoading = false;

  if (typeof loadingFn === 'string') {
    loadingFn = [loadingFn];
  }

  if (Array.isArray(loadingFn)) {
    isLoading = loadingFn.some((loadingProp) => {
      const result = lodashGet(componentContext.props, loadingProp);
      if (checkIsStatus(result)) {
        return result.isFetching || !result.isLoaded;
      }
      return checkLoaded ? !result : result;
    });
  } else if (typeof loadingFn === 'function') {
    isLoading = loadingFn.call(componentContext, componentContext);
  } else {
    throw new Error(`Wrong format for checkLoading: ${loadingFn}`);
  }
  return isLoading;
}

export const DEFAULT_LOADER_COMPONENT = LoadingComponent;
export const DEFAULT_LOADER_PROPS = {
  isLoading: true,
  withText: true,
};

function loadingComponentDecorator(
  loadingFn,
  {
    loaderNode,
    loaderComponent = DEFAULT_LOADER_COMPONENT,
    loaderProps = {},
    checkLoaded = false,
  } = {},
) {
  return (targetReactComponent) => {
    const old = {
      render: targetReactComponent.prototype.render,
    };

    targetReactComponent.prototype.render = function render() {
      const componentContext = this;
      return checkLoading(loadingFn, componentContext, checkLoaded)
        ? loaderNode || React.createElement(loaderComponent, {
          ...DEFAULT_LOADER_PROPS,
          ...loaderProps,
        })
        : old.render.call(componentContext);
    };

    return targetReactComponent;
  };
}

export const loading = loadingComponentDecorator;

export function loaded(loadingFn, options = {}) {
  return loadingComponentDecorator(loadingFn, {
    ...options,
    checkLoaded: true,
  });
}

export default loading;


