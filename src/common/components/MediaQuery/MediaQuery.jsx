import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Responsive from 'react-responsive';

export const MAX_SIZES = {
  // todo @ANKU @LOW - WATCH
  EXTRA_SMALL: 480,
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  WIDE_SCREEN: 100000,
};

export const SIZES_ARRAY = [
  MAX_SIZES.EXTRA_SMALL,
  MAX_SIZES.MOBILE,
  MAX_SIZES.TABLET,
  MAX_SIZES.DESKTOP,
  MAX_SIZES.WIDE_SCREEN,
];

export function getMinSize(maxSize) {
  const minSizeIndex = SIZES_ARRAY.indexOf(maxSize);
  return minSizeIndex === 0 ? 0 : SIZES_ARRAY[minSizeIndex - 1];
}
export function getMaxSize(minSize) {
  const minSizeIndex = SIZES_ARRAY.indexOf(minSize);
  return minSizeIndex === SIZES_ARRAY.length - 1 ? 1000000 : SIZES_ARRAY[minSizeIndex + 1];
}

export default class MediaQuery extends Component {
  /*
   minimum sizes from mixins.scss:
   $xs: 0; // Extra small screen / phone
   $sm: 480px; // Small screen / phone
   $md: 768px; // Medium screen / tablet
   $lg: 1024px; // Large screen / desktop
   $xl: 1200px; // Extra large screen / wide desktop
   */
  static SIZES = MAX_SIZES;

  static propTypes = {
    // component,
    ...Responsive.propTypes,
    maxSize: PropTypes.oneOf(SIZES_ARRAY),
    minSize: PropTypes.oneOf(SIZES_ARRAY),
    mobile: PropTypes.bool,
    strict: PropTypes.bool,
  };

  static defaultProps = {
    mobile: undefined,
    strict: false,
  };

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      minSize,
      maxSize,
      mobile,
      strict,
      children,
      ...mediaQueryLibProps
    } = this.props;

    const { MOBILE } = MAX_SIZES;
    let minWidth;
    let maxWidth;

    if (mobile === true) {
      minWidth = strict ? getMinSize(MOBILE) : undefined;
      maxWidth = MOBILE;
    } else if (mobile === false) {
      minWidth = MOBILE;
      maxWidth = undefined;
    } else {
      minWidth = minSize;
      maxWidth = maxSize;

      if (strict) {
        if (minSize) {
          maxWidth = getMaxSize(minSize);
        } else {
          minWidth = getMinSize(maxSize);
        }
      }
    }

    return !minWidth && maxWidth === SIZES_ARRAY[SIZES_ARRAY.length - 1]
    ? children
    : (
      <Responsive
        minWidth={ minWidth }
        maxWidth={ maxWidth }
        { ...mediaQueryLibProps }
      >
        { children }
      </Responsive>
    );
  }
}
