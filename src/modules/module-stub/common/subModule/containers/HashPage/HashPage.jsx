import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// import i18n from '../../i18n';
import getComponents from '../../get-components';

import MODULE_NAME from '../../module-name';

const {
  ModuleLink,
  Button,
} = getComponents();

export default class HashPage extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  // componentDidUpdate(prevProps, prevState, snapshot) {
  // }

  // ======================================================
  // HANDLERS
  // ======================================================


  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      className,
    } = this.props;

    return (
      <div className={ `HashPage ${className || ''}` }>
        <div id="test1" style={{ paddingBottom: 800 }}>
          Test 1
        </div>

        <div id="test2" style={{ paddingBottom: 800 }}>
          Test 2
        </div>

        <div id="test3" style={{ paddingBottom: 800 }}>
          Test 3
          <ModuleLink
            moduleName={ MODULE_NAME }
            modulePath="hashRouterTest"
            modulePathHash="test1"
          >
            Go to first
          </ModuleLink>
        </div>
      </div>
    );
  }
}
