import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { executeVariable } from '../../common';

import * as reduxCurrentPage from '../../../app-redux/reducers/app/current-page';

/**
 * Декорирует компонент, проставляя указанные данные в заголовок и в хедар документа
 * @param id
 * @param title
 * @param metas - html head meta tags for current page [description, keywords, author, robots, googlebot, google and e.t.]
 *                (для CEO, используется в Server Side Rendering, отдачавая поисковым ботам инфу о конкретной странице)
 * @param otherInfo
 * @returns {function(*)}

 import { getCurrentPage } from '../../../app-redux/selectors';

 @connect(
  (globalState) => {
    const {
     id: null, // id
     title: null,
     metas = {},
     otherInfo,
    } = getCurrentPage(globalState);
  }
 )
*/
export default function titledDecorator(
  id,
  title,
  metas = {},
  otherInfo = {},
) {
  return (ReactComponentClass) => {
    @connect(
      null,
      {
        actionCurrentPageChanged: reduxCurrentPage.actions.actionCurrentPageChanged,
        actionClearCurrentPageInfo: reduxCurrentPage.actions.actionClearCurrentPageInfo,
      },
    )
    class TitledComponent extends Component {
      static propTypes = {
        actionCurrentPageChanged: PropTypes.func,
        actionClearCurrentPageInfo: PropTypes.func,
      };

      // ======================================================
      // LIFECYCLE
      // ======================================================
      componentWillMount() {
        const idFinal = executeVariable(id, null, this.props);
        this.props.actionCurrentPageChanged({
          id: idFinal,
          title: executeVariable(title, null, this.props),
          metas: executeVariable(metas, null, this.props),
          otherInfo: executeVariable(otherInfo, null, this.props),
        });
      }
      componentWillUnmount() {
        const idFinal = executeVariable(id, null, this.props);
        this.props.actionClearCurrentPageInfo(idFinal);
      }

      render() {
        return (
          <ReactComponentClass
            { ...this.props }
          />
        );
      }
    }

    return TitledComponent;
  };
}
