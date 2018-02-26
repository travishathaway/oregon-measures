import {connect} from 'react-redux';
import {
  fetchMeasureYears, fetchMeasureYearsSuccess, fetchMeasureYearsFailure,
  setFilters, fetchMeasures, fetchMeasuresSuccess, fetchMeasuresFailure
} from '../actions/measure_list';
import {MeasureCategoricalFilter} from '../components/measure';


const mapStateToProps = (state) => {
  return {
    years: state.measureList.years,
    filters: state.measureList.filters
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchMeasureYears: () => {
      dispatch(
        fetchMeasureYears()
      ).then((response) => {
        !response.error ? dispatch(
          fetchMeasureYearsSuccess(response.payload.data)
        ) : dispatch(
          fetchMeasureYearsFailure(response.payload.data)
        );
      });
    },
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
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(MeasureCategoricalFilter);
