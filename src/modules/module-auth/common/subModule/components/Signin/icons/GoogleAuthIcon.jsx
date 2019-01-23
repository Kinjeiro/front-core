import React from 'react';
import PropTypes from 'prop-types';

const GoogleAuthIcon = ({ className }) => (
  <svg className={ `GoogleAuthIcon ${className || ''}` } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
    <defs>
      <style>
        {'.cls-1{fill:#fff}.cls-2{fill:#fbbb00}.cls-3{fill:#518ef8}.cls-4{fill:#28b446}.cls-5{fill:#f14336}'}
      </style>
    </defs>
    <g id="Group_334" data-name="Group 334">
      <rect id="Rectangle_188" width="30" height="30" className="cls-1" data-name="Rectangle 188" rx="3" />
      <g id="_001-search" data-name="001-search" transform="translate(5 5)">
        <path
          id="Path_5"
          d="M4.432 144.953l-.7 2.6-2.544.054a10.017 10.017 0 0 1-.074-9.338l2.265.415.992 2.252a5.968 5.968 0 0 0 .056 4.018z"
          className="cls-2"
          data-name="Path 5"
          transform="translate(0 -132.867)"
        />
        <path
          id="Path_6"
          d="M271.233 208.176a10 10 0 0 1-3.565 9.666l-2.853-.146-.4-2.521a5.96 5.96 0 0 0 2.564-3.043h-5.347v-3.956h9.605z"
          className="cls-3"
          data-name="Path 6"
          transform="translate(-251.408 -200.044)"
        />
        <path
          id="Path_7"
          d="M45.577 315.121a10 10 0 0 1-15.069-3.059l3.241-2.653a5.947 5.947 0 0 0 8.57 3.045z"
          className="cls-4"
          data-name="Path 7"
          transform="translate(-29.317 -297.323)"
        />
        <path
          id="Path_8"
          d="M43.889 2.3l-3.24 2.652a5.947 5.947 0 0 0-8.767 3.114L28.625 5.4a10 10 0 0 1 15.264-3.1z"
          className="cls-5"
          data-name="Path 8"
          transform="translate(-27.506)"
        />
      </g>
    </g>
  </svg>
);

GoogleAuthIcon.propTypes = {
  className: PropTypes.string,
};

export default GoogleAuthIcon;
