import {connect} from 'react-redux';
import {
  fetchMeasures, fetchMeasuresSuccess, fetchMeasuresFailure,
  resetMeasures, resetFilters
} from '../actions/measure_list';
import MeasureList from '../components/MeasureList';


const mapStateToProps = (state) => {
  return {
    measures: state.measureList.measures,
    filters: state.measureList.filters
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
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
    resetMeasures: () => {
      dispatch(resetMeasures());
    },
    resetFilters: () => {
      dispatch(resetFilters());
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(MeasureList);
