import axios from 'axios';

export const FETCH_MEASURE = 'FETCH_MEASURE';
export const FETCH_MEASURE_SUCCESS = 'FETCH_MEASURE_SUCCESS';
export const FETCH_MEASURE_FAILURE = 'FETCH_MEASURE_FAILURE';
export const RESET_ACTIVE_MEASURE = 'RESET_ACTIVE_MEASURE';

export const FETCH_OREGON_GEOJSON = 'FETCH_OREGON_GEOJSON';
export const FETCH_OREGON_GEOJSON_SUCCESS = 'FETCH_OREGON_GEOJSON_SUCCESS';
export const FETCH_OREGON_GEOJSON_FAILURE = 'FETCH_OREGON_GEOJSON_FAILURE';

const ROOT_URL = window.oregonMeasureApp.apiUrl;
const GEOJSON_URL = window.oregonMeasureApp.geoJson;


export function fetchMeasure(year, number) {
  const request = axios({
    method: 'get',
    url: `${ROOT_URL}/measure/${year}/${number}`
  });

  return {
    type: FETCH_MEASURE,
    payload: request
  }
}

export function fetchMeasureSuccess(measures) {
  return {
    type: FETCH_MEASURE_SUCCESS,
    payload: measures
  }
}

export function fetchMeasureFailure(error) {
  return {
    type: FETCH_MEASURE_FAILURE,
    payload: error
  }
}

export function resetActiveMeasure() {
  return {
    type: RESET_ACTIVE_MEASURE,
    payload: {}
  }
}

export function fetchOregonGeojson(year, number) {
  const request = axios({
    method: 'get',
    url: `${GEOJSON_URL}`
  });

  return {
    type: FETCH_OREGON_GEOJSON,
    payload: request
  }
}

export function fetchOregonGeojsonSuccess(measures) {
  return {
    type: FETCH_OREGON_GEOJSON_SUCCESS,
    payload: measures
  }
}

export function fetchOregonGeojsonFailure(error) {
  return {
    type: FETCH_OREGON_GEOJSON_FAILURE,
    payload: error
  }
}
