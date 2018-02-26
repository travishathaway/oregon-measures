import {
  FETCH_MEASURE, FETCH_MEASURE_SUCCESS, FETCH_MEASURE_FAILURE,
  RESET_ACTIVE_MEASURE, FETCH_OREGON_GEOJSON, FETCH_OREGON_GEOJSON_SUCCESS,
  FETCH_OREGON_GEOJSON_FAILURE
} from '../actions/measure_detail'

const INITIAL_STATE = { 
  measure: {
    detail: null, 
    error: null, 
    loading: false
  },
  geojson: {
    data: null,
    error: null,
    loading: false
  }
};

export default function(state = INITIAL_STATE, action){
  let error;

  switch(action.type) {
    case FETCH_MEASURE:
      return {
        ...state, 
        measure: {
          detail: null, 
          error: null, 
          loading: true
        }
      };

    case FETCH_MEASURE_SUCCESS:
      return { ...state, 
        measure: {
          detail: action.payload,
          error: null,
          loading: false
        }
      };

    case FETCH_MEASURE_FAILURE:
      error = action.payload || {message: action.payload.message};

      return { ...state, 
        measure: {
          detail: action.payload,
          error: error,
          loading: false
        }
      }

    case RESET_ACTIVE_MEASURE:
      return { ...state, 
        measure: {
          detail: undefined,
          error: null,
          loading: false
        }
      }

    case FETCH_OREGON_GEOJSON:
      return { ...state,
        geojson: {
          data: {},
          error: null,
          loading: true
        }
      }

    case FETCH_OREGON_GEOJSON_SUCCESS:
      return { ...state,
        geojson: {
          data: action.payload,
          error: null,
          loading: true
        }
      }

    case FETCH_OREGON_GEOJSON_FAILURE:
      error = action.payload || {message: action.payload.message};

      return { ...state, 
        measure: {
          detail: action.payload,
          error: error,
          loading: false
        }
      }
    
    default:
      return state;
  }
}
