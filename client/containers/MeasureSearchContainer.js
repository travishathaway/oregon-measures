import {connect} from 'react-redux';
import {
    fetchMeasures, fetchMeasuresSuccess, fetchMeasuresFailure,
    setFilters, resetMeasures
} from '../actions/measure_list';
import MeasureSearch from '../components/MeasureSearch';


const mapStateToProps = (state) => {
  return {
    measures: state.measureList.measures,
    filters: state.measureList.filters
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    fetchMeasures: (filters) => {
      dispatch(
        fetchMeasures(filters)
      ).then((response) => {
        !response.error ? dispatch(
          fetchMeasuresSuccess(response.payload.data)
        ) : dispatch(
          fetchMeasuresFailure(response.payload.data)
        );
      });
    },
    setFilters: (filters) => {
      dispatch(setFilters(filters));
    },
    resetMeasures: () => {
      dispatch(resetMeasures());
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(MeasureSearch);
