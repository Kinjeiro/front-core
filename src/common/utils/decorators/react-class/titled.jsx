import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { deepEquals, executeVariable } from '../../common';

import * as reduxCurrentPage from '../../../app-redux/reducers/app/current-page';

/**
 * Декорирует компонент, проставляя указанные данные в заголовок и в хедар документа
 * @param id
 * @param title - не более 50 символов (Если title длинный, поисковая система сама выберет, какие 70 символов показать
 *   пользователю в соответствии с введенным запросом. И этот выбор непредсказуем)(50–57 символов для Google;  65–70
 *   символов для Яндекс)
 * @param metas - html head meta tags for current page [description, keywords, author, robots, googlebot, google and
 *   e.t.]
 *                (для CEO, используется в Server Side Rendering, отдачавая поисковым ботам инфу о конкретной странице)
 *                - description - не более 150 символов, в 60% случаев Google формирует сниппет из мета-тега
 *   description.
 *                - keywords (optional, ignored by Google)
                  - robots (optional, used by Google)
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
      // UTILS
      // ======================================================
      getPageInfo(props = this.props) {
        return {
          id: executeVariable(id, null, props),
          title: executeVariable(title, null, props),
          metas: executeVariable(metas, null, props),
          otherInfo: executeVariable(otherInfo, null, props),
        };
      }
      // ======================================================
      // LIFECYCLE
      // ======================================================
      componentWillMount() {
      // componentDidMount() {
        this.props.actionCurrentPageChanged(this.getPageInfo());
      }
      componentWillReceiveProps(nextProps, nextContext) {
        const newPageInfo = this.getPageInfo(nextProps);
        const prevPageInfo = this.getPageInfo();

        if (!deepEquals(newPageInfo, prevPageInfo)) {
          this.props.actionCurrentPageChanged(newPageInfo);
        }
      }

      // componentWillUnmount() {
      //   const idFinal = executeVariable(id, null, this.props);
      //   this.props.actionClearCurrentPageInfo(idFinal);
      // }

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
