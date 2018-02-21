import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import MeasureListReducer from './measure_list';
import MeasureDetailReducer from './measure_detail';

const rootReducer = combineReducers({
  measureList: MeasureListReducer,
  measureDetail: MeasureDetailReducer
});

export default rootReducer;
