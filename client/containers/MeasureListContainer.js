import {connect} from 'react-redux';
import {fetchMeasures, fetchMeasuresSuccess, fetchMeasuresFailure} from '../actions/measure_list';
import MeasureList from '../components/MeasureList';

const mapStateToProps = (state) => {
  return {
    measures: state.measureList.measures
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    fetchMeasures: () => {
      dispatch(
        fetchMeasures()
      ).then((response) => {
        !response.error ? dispatch(
          fetchMeasuresSuccess(response.payload.data)
        ) : dispatch(
          fetchMeasuresFailure(response.payload.data)
        );
      });
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(MeasureList);
