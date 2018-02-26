import {
  FETCH_MEASURES, FETCH_MEASURES_SUCCESS, FETCH_MEASURES_FAILURE,
  FETCH_MEASURE_YEARS, FETCH_MEASURE_YEARS_SUCCESS, FETCH_MEASURE_YEARS_FAILURE,
  RESET_MEASURES, SET_FILTERS, RESET_FILTERS
} from '../actions/measure_list'

const INITIAL_STATE = { 
  measures: {
    list: [], 
    error: null, 
    loading: false
  },
  filters: {
    search: "",
    years: []
  },
  years: {
    list: [],
    error: null, 
    loading: false
  }
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
          loading: true,
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

    case RESET_MEASURES:
      return {
        ...state,
        measures: {
          list: [],
          error: null,
          loading: false
        }
      }

    case FETCH_MEASURE_YEARS:
      return {
        ...state, 
        years: {
          list: [],
          error: null,
          loading: true,
        }
      }

    case FETCH_MEASURE_YEARS_SUCCESS:
      return {
        ...state, 
        years: {
          list: action.payload,
          error: null,
          loading: false
        }
      }

    case FETCH_MEASURE_YEARS_FAILURE:
      error = action.payload || {message: action.payload.message};

      return {
        ...state, 
        years: {
          list: action.payload,
          error: error,
          loading: false
        }
      }


    case SET_FILTERS:
      var filters = {};

      if (state.filters !== undefined) {
        filters = state.filters;
      }

      return {
        ...state,
        filters: {...filters, ...action.payload}
      }

    default:
      return state;
  }
}
