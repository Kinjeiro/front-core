import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { StickyContainer } from 'react-sticky';
import { Helmet } from 'react-helmet';

import clientConfig from '../../client-config';
import bemDecorator from '../../utils/decorators/bem-component';
import i18n from '../../utils/i18n-utils';

// ======================================================
// REDUX
// ======================================================
import { getCurrentPage } from '../../app-redux/selectors';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import getComponents from '../../get-components';

import ContextModulesProvider from '../../contexts/ContextModules/ContextModulesProvider';

const {
  ThemeProvider,
  Notifications,
} = getComponents();

require('./CoreApp.css');

@connect(
  (state) => ({
    currentPage: getCurrentPage(state),
  }), {
    actionGoTo: push,
  },
)
@bemDecorator('CoreApp')
export default class CoreApp extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    children: PropTypes.node,
    themeProviderProps: PropTypes.shape(ThemeProvider.propTypes),
    modulesProviderProps: PropTypes.shape(ContextModulesProvider.propTypes),

    // ======================================================
    // CONNECT
    // ======================================================
    currentPage: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
    }),
    actionGoTo: PropTypes.func,
  };
  static defaultProps = {
    themeProviderProps: {},
    modulesProviderProps: {
      // moduleToRoutePrefixMap: {
      //   testModule: 'opa',
      // },
    },
  };

  /*
   // todo @ANKU @LOW - непонятная бага, может плохо static подцепляется в babel?

   Uncaught Error: CoreApp.getChildContext(): childContextTypes must be defined in order to use getChildContext().
   at invariant (invariant.js:44)
   at ReactCompositeComponentWrapper._processChildContext (ReactCompositeComponent.js:514)
   at ReactCompositeComponentWrapper.performInitialMount (ReactCompositeComponent.js:370)
   at ReactCompositeComponentWrapper.mountComponent (ReactCompositeComponent.js:257)

   static childContextTypes = {
   actionGoTo: PropTypes.func
   };

   getChildContext() {
   return {
   actionGoTo: this.props.actionGoTo
   };
   }

   //static contextTypes = {
   //  // todo @ANKU @LOW @BUG_OUT @react-redux - а должны были добавить уже существующие а не заменять полностью
   //  //так как мы явно определяем, мы перезаписываем поведение @connect, добавляющего store в контексты
   //  store: PropTypes.any,
   //  i18nInfo: PropTypes.any
   //};
  */




  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      children,
      themeProviderProps,
      modulesProviderProps,
      currentPage: {
        id,
        title,
        metas,
      },
    } = this.props;


    // todo @ANKU @LOW - вынести настройки графических компонентов таких как Логин \\ Нотификации в спец расширяемый в ClientRunner класс Layout
    return (
      <ContextModulesProvider { ...modulesProviderProps } >
        <ThemeProvider
          className={ this.bem('ThemeProvider') }
          { ...themeProviderProps }
        >
          <StickyContainer className={ this.bem('StickyContainer') }>
            <Helmet>
              <title>{title || id || ' '}</title>
              {
                Object.keys(metas).map((metaName) => (
                  <meta
                    key={ metaName }
                    name={ metaName }
                    content={ metas[metaName] }
                  />
                ))
              }
            </Helmet>

            { children }

            {
              clientConfig.common.features.notifications && clientConfig.common.features.notifications.ui && (
                <Notifications />
              )
            }
          </StickyContainer>
        </ThemeProvider>
      </ContextModulesProvider>
    );
  }
}
