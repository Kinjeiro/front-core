import React from 'react';

export default function SvgIcon({
  viewBox = '0 0 24 24',
  size = 24,
  width,
  height,
  children,
}) {
  width = width || size;
  height = height || size;
  return (
    <svg width={width} height={height} viewBox={viewBox}>
      {children}
    </svg>
  );
}
