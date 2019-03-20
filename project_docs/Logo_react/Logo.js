import React from 'react';

import SvgIcon from './SvgIcon';

export default function Logo({
  color = '#80082a',
  height = 24,
}) {
  return (
    <SvgIcon viewBox="0 0 272.04 54.92" width={ height * (272.04 / 54.92) } height={ height }>
      <path
        fill={ color }
        fillRule="evenodd"
        d="M40,44.88S10.32,51.51,5.78,31.32A36.28,36.28,0,0,1,9.23,20.13c1.27-2.4,3.76-5.44,7.84-4.81,6.63,1,4.84,9.91,6.46,16C25.6,39,29.54,45.68,40,44.88Z"
        transform="translate(-4.7 -11.05)"
      ></path>
      <path
        fill={ color }
        fillRule="evenodd"
        d="M108.73,33.61a21,21,0,0,0,1.62,7.47c2.61,5.43,7.14,10.11,14.3,10.59a25.6,25.6,0,0,0,6.6-.69c6-1.27,10.7-5.27,14.71-8.66a84.36,84.36,0,0,1,8.94-6.6c5.27-3.37,10.52-6.59,19.66-5.64A19.32,19.32,0,0,1,188.44,39c1.19,1.84,1.85,3.82,3.72,3.85,1.48,0,2.22-1.29,3.16-2.34,4.44-5,13-11.11,23-8.66a17.57,17.57,0,0,1,10.18,7.7c1.43,2.16,2.49,5,4.81,5.09,1.11,0,2.32-1,3.44-1.79,4.39-3.14,8.64-5.67,17-4.95,6.28.53,11.46,4.1,15.13,8.66a51.14,51.14,0,0,1,6.6,11.14c.54,1.26,1.44,3.12,1.24,4.67A4.77,4.77,0,0,1,272.87,66c-1.79.09-4-1.88-4.95-3-1.61-2-2.81-4.64-4.4-7-2.29-3.41-5-7.08-10.45-7.15-9.3-.12-12.3,9.18-17.33,13.2a5.83,5.83,0,0,1-5.08,1.65c-2.19-.35-3.85-2.29-4.95-4.13C222.79,54.68,221,45,215,43.28a6.82,6.82,0,0,0-3.3,0c-7.9,1.78-10.9,12-14.71,18.15-1.9,1.92-4.52,4.23-8.39,2.89a8,8,0,0,1-4.12-3.85c-2.1-3.76-2.73-9.47-5.09-13.48-1.19-2-3.79-4.5-6.74-4.67-4.63-.27-9.75,3.9-12.51,6-5.49,4.29-9.59,8.67-15.81,11.82a49.9,49.9,0,0,1-13.75,4.68c-7.06,1.25-14.88.23-21.45-1.65-11.87-3.41-19-11.8-19.93-26.31C99.93,27.46,106.72,20.41,108.73,33.61Z"
        transform="translate(-4.7 -11.05)"
      ></path>
      <path
        fill={ color }
        fillRule="evenodd"
        d="M109.73,30.61c-.38-5.06-.11-10.49-2.09-14-1.72-3-7-6.48-11.83-5.36-5.38,1.25-9.77,5.58-14,9.07S74,27.44,69.55,31.21a109,109,0,0,1-13.47,9.62,33.94,33.94,0,0,1-8,3.58c-2.82.86-5.91,2.23-9.07,2.47,0,0-29.71,6.63-34.25-13.56a24.93,24.93,0,0,0,0,4.07c.67,6.37,2.9,9.7,6.19,13.48A26.62,26.62,0,0,0,22.8,59.12a31.3,31.3,0,0,0,8,2.06,54,54,0,0,0,8.8.27c5.34-.48,10.51-2.69,15.12-4.53A96.05,96.05,0,0,0,68,50.59c4.08-2.39,7.76-5.41,11.55-8.11C96.5,30.41,107.12,13.49,109.73,30.61Z"
        transform="translate(-4.7 -11.05)"
      ></path>
    </SvgIcon>
  )
}