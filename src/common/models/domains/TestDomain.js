import PropTypes from 'prop-types';
import { fk, many, attr, Model } from 'redux-orm';

import { getRandomInt } from '../../utils/common';

import CrudModel from './utils/CrudModel';

export default class TestDomain extends CrudModel {
  static modelName = 'TestDomain';

  static fields = {
    // id: attr(),
    id: attr({ getDefault: () => `T${CrudModel.nextId()}` }),
    value: attr(),
  };

  // todo @ANKU @CRIT @BUG_OUT @redux-orm - явно не дают создавать string id
  // static nextId(prevId) {
  //  return `T${CrudModel.nextId(prevId)}`;
  // }

  static propTypes = {
    id: PropTypes.number,
    value: PropTypes.number,
  };
}
