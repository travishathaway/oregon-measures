import {connect} from 'react-redux';
import {
    fetchMeasure, fetchMeasureSuccess, fetchMeasureFailure,
    fetchOregonGeojson, fetchOregonGeojsonSuccess, fetchOregonGeojsonFailure,
    resetActiveMeasure
} from '../actions/measure_detail';
import MeasureDetail from '../components/MeasureDetail';

const mapStateToProps = (state, ownProps) => {
  return {
    measure: state.measureDetail.measure,
    year: ownProps.year,
    number: ownProps.number,
    geojson: state.measureDetail.geojson
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchMeasure: (year, number) => {
      dispatch(
        fetchMeasure(year, number)
      ).then((response) => {
        !response.error ? dispatch(
          fetchMeasureSuccess(response.payload.data)
        ) : dispatch(
          fetchMeasureFailure(response.payload.data)
        );
      });
    },
    fetchOregonGeojson: () => {
      dispatch(
        fetchOregonGeojson()
      ).then((response) => {
        !response.error ? dispatch(
          fetchOregonGeojsonSuccess(response.payload.data)
        ) : dispatch(
          fetchOregonGeojsonFailure(response.payload.data)
        );
      });
    },
    resetActiveMeasure: () => {
      dispatch(resetActiveMeasure());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MeasureDetail);
