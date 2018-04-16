import { Model } from 'redux-orm';

// todo @ANKU @LOW - не работает с react-props
/*
 invariant.js:42 Uncaught Error: Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types
 at invariant (invariant.js:42)
 at checkType (factoryWithTypeCheckers.js:160)
 at validateProp (index.js:26)
 at index.js:42
 at _createBaseFor.js:17
 at baseForOwn (_baseForOwn.js:13)
 at forOwn (forOwn.js:33)
 at validateProps (index.js:41)
 at Function.create (index.js:117)
 at Function.reducer (CrudModel.js:57)
*/
// import propTypesMixin from 'redux-orm-proptypes';
//
// const ValidatingModel = propTypesMixin(Model);

export default class UniModel extends Model {
}
