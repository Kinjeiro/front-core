import { combineReducers } from 'redux';

import filters from './filters';
import forms from './forms';

export default combineReducers({
  filters,
  forms,
});

