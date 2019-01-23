import React from 'react';
import PropTypes from 'prop-types';

const FbAuthIcon = ({ className }) => (
  <svg className={ `FbAuthIcon ${className || ''}` } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
    <defs>
      <style>{'.cls-1{fill:#fff}'}</style>
    </defs>
    <g id="_002-facebook-app-logo" data-name="002-facebook-app-logo">
      <path
        id="Path_9"
        d="M28.343 0H1.656A1.656 1.656 0 0 0 0 1.657v26.687A1.656 1.656 0 0 0 1.656 30h14.368V18.383h-3.91v-4.528h3.909v-3.339c0-3.874 2.366-5.985 5.822-5.985a32.425 32.425 0 0 1 3.493.178v4.05h-2.4c-1.88 0-2.242.894-2.242 2.2v2.89h4.484l-.58 4.532h-3.9V30h7.644A1.657 1.657 0 0 0 30 28.344V1.656A1.656 1.656 0 0 0 28.343 0z"
        className="cls-1"
        data-name="Path 9"
        transform="translate(0 -.001)"
      />
    </g>
  </svg>
);

FbAuthIcon.propTypes = {
  className: PropTypes.string,
};

export default FbAuthIcon;
