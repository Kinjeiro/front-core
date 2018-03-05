/* eslint-disable no-unused-vars */
import { createReducer } from '../utils';

import { FIELD_ACTION_UUID } from './simple-module-factory';

const errorNotImplemented = new Error('Not implemented');

export default class ReduxUni {
  static FIELD_ACTION_UUID = FIELD_ACTION_UUID;

  constructor(getSliceStateFn) {
    this.getSliceStateFn = getSliceStateFn;
  }

  getSliceState(globalState, tableUuid) {
    return this.getSliceStateFn(globalState, tableUuid);
  }

  getFeaturesMap(field, defaultValue = {}) {
    return Object.assign(
      {},
      ...this.getFeatures(this.getPrefix()).map((feature) =>
        (typeof feature[field] !== 'undefined' ? feature[field] : defaultValue)),
    );
  }

  // ======================================================
  // INITIAL STATE
  // ======================================================
  getInitialState() {
    return this.getFeaturesMap('initialState');
  }

  // ======================================================
  // FEATURES
  // ======================================================
  // getFeatures(PREFIX) {
  //   return [
  //     {
  //       initialState: {},
  //       TYPES: {},
  //       getBindActions: (api, TYPES) => {},
  //       caseReducers: {},
  //       sliceReducers: {},
  //     },
  //   ];
  // }
  getFeatures(PREFIX) {
    return [];
  }


  // ======================================================
  // TYPES
  // ======================================================
  getPrefix() {
    throw errorNotImplemented;
  }

  getTypes(PREFIX) {
    return this.getFeaturesMap('TYPES');
  }

  // ======================================================
  // ACTIONS
  // ======================================================
  getBindActions(api = {}, TYPES = this.getTypes(this.getPrefix())) {
    return Object.assign(
      {},
      ...this.getFeatures(this.getPrefix()).map(({ getBindActions }) =>
        (typeof getBindActions !== 'undefined' ? getBindActions.call(this, api, TYPES) : {})),
    );
  }

  getActions(api) {
    return this.getBindActions(api, this.getTypes(this.getPrefix()));
  }

  getApi() {
    return {};
  }

  // ======================================================
  // REDUCER
  // ======================================================
  getCaseReducers(TYPES) {
    return this.getFeaturesMap('caseReducers');
  }
  getSliceReducers(TYPES) {
    return this.getFeaturesMap('sliceReducers');
  }

  getReducer() {
    const TYPES = this.getTypes(this.getPrefix());

    return createReducer(
      this.getInitialState(),
      this.getCaseReducers(TYPES),
      this.getSliceReducers(TYPES),
    );
  }


  // ======================================================
  // MODULE
  // ======================================================
  getModule(api = this.getApi()) {
    return {
      initialState: this.getInitialState(),
      TYPES: this.getTypes(this.getPrefix()),
      getBindActions: this.getBindActions.bind(this),
      actions: api ? this.getBindActions(api) : undefined,
      reducer: this.getReducer(),
    };
  }
}
