import {
  FETCH_MEASURES, FETCH_MEASURES_SUCCESS, FETCH_MEASURES_FAILURE,
  RESET_MEASURES
} from '../actions/measure_list'

const INITIAL_STATE = { 
  measures: {
    list: [], 
    error: null, 
    loading: false
  },
};

export default function(state = INITIAL_STATE, action){
  let error;

  switch(action.type){
    case FETCH_MEASURES:
      return {
        ...state, 
        measures: {
          list: [],
          error: null,
          loading: true
        }
      }

    case FETCH_MEASURES_SUCCESS:
      return {
        ...state, 
        measures: {
          list: action.payload,
          error: null,
          loading: false
        }
      }

    case FETCH_MEASURES_FAILURE:
      error = action.payload || {message: action.payload.message};

      return {
        ...state, 
        measures: {
          list: action.payload,
          error: error,
          loading: false
        }
      }
    case FETCH_MEASURES_FAILURE:
      return {
        ...state, 
        measures: {
          list: [],
          error: null,
          loading: false
        }
      }

    default:
      return state;
  }
}
