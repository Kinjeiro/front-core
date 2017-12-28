import {
  createTestStore,
  testStatusReducer,
} from '../../../../test/client/redux-test-utils';
import { delayPromiseThen } from '../../../utils/common';

import {
  initialState,
  TYPES,
  actions,
  getBindActions,
  default as reducer,
} from './i18n-info';

describe('(Redux Module) i18n-info', () => {
  describe('(Reducer)', () => {
    it('Should be a function.', () => {
      expect(reducer)
        .to.be.a('function');
    });

    it('Should initialize with a state of whitelist as empty array []', () => {
      expect(reducer(undefined, {}).whitelist)
        .to.deep.equal([]);
    });

    it('Should return the previous state if an action was not matched.', () => {
      let state = reducer(undefined, {});
      expect(state.whitelist).to.deep.equal([]);
      state = reducer(state, { type: '@@@@@@@' });
      expect(state.whitelist).to.deep.equal([]);
      state = reducer(state, actions.actionI18nInfoInit(['en'], 'en'));
      expect(state.whitelist).to.deep.equal(['en']);
      state = reducer(state, { type: '@@@@@@@' });
      expect(state.whitelist).to.deep.equal(['en']);
    });
  });

  describe('(Action Creator) actionI18nInfoInit', () => {
    let actionI18nInfoInit;

    before(() => {
      actionI18nInfoInit = getBindActions().actionI18nInfoInit;
    });

    it('Should be exported as a function.', () => {
      expect(actionI18nInfoInit)
        .to.be.a('function');
    });

    it('Should return an action with type "I18N_INFO_INIT".', () => {
      expect(actionI18nInfoInit())
        .to.have.property('type', TYPES.I18N_INFO_INIT);
    });

    it('Should default "language" of "payload" property be undefined.', () => {
      expect(actionI18nInfoInit(['en']))
        .to.have.property('payload')
        .to.deep.equals({
          whitelist: ['en'],
          language: undefined,
        });
    });

    it('Should assign parameters to the "payload" property.', () => {
      expect(actionI18nInfoInit(['en'], 'en'))
        .to.have.property('payload')
        .to.deep.equal({
          whitelist: ['en'],
          language: 'en',
        });
    });

    it('Should initialize state with "whitelist" parameter', () => {
      let state = reducer();
      expect(state.whitelist).to.deep.equal(initialState.whitelist);
      state = reducer(state, actionI18nInfoInit(['en']));
      expect(state.whitelist).to.deep.equal(['en']);
    });

    it('Should initialize state with "language" parameter', () => {
      let state = reducer();
      expect(state.language).to.deep.equal(initialState.language);
      state = reducer(state, actionI18nInfoInit(['en'], 'en'));
      expect(state.language).to.deep.equal('en');
    });
  });

  describe('(Action Creator)(async) actionI18NChangeLanguage', () => {
    let actionI18NChangeLanguage;
    let spyApiI18NChangeLanguage;

    let store;
    let dispatchAction;
    let getReducerSliceState;

    beforeEach(() => {
      store = createTestStore('i18nInfo', reducer);
      dispatchAction = store.dispatch.bind(store);
      getReducerSliceState = () => store.getState().i18nInfo;

      spyApiI18NChangeLanguage = sinon.spy(delayPromiseThen(200));
      actionI18NChangeLanguage = getBindActions({
        apiI18NChangeLanguage: spyApiI18NChangeLanguage,
      }).actionI18NChangeLanguage;
    });

    it('Should be exported as a function.', () => {
      expect(actionI18NChangeLanguage)
        .to.be.a('function');
    });

    it('Should return payload as promise that return language.', () => {
      const promise = actionI18NChangeLanguage('en').payload;
      expect(!!promise.then).to.be.true;
      // return promise.should.eventually.be.fulfilled;
      return promise.then((newLanguage) =>
        expect(newLanguage)
          .to.deep.equal('en'));
    });

    it('Should change language in state', () => {
      expect(getReducerSliceState().language).to.deep.equals(null);
      return dispatchAction(actionI18NChangeLanguage('en'))
        .then(() => {
          expect(spyApiI18NChangeLanguage.calledOnce).to.be.true;
          expect(getReducerSliceState().language)
            .to.deep.equals('en');
        });
    });

    it('Should change actionI18NChangeLanguageStatus when action proceed', () => {
      return testStatusReducer(
        'actionI18NChangeLanguageStatus',
        actionI18NChangeLanguage.bind(null, 'en'),
        dispatchAction,
        getReducerSliceState,
      );
    });
  });
});
