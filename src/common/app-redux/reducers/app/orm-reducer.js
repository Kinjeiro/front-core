import { createReducer } from 'redux-orm';

import orm from '../../../models/domains/utils/orm';

export default createReducer(orm);

