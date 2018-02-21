import axios from 'axios';

export const FETCH_MEASURES = 'FETCH_MEASURES';
export const FETCH_MEASURES_SUCCESS = 'FETCH_MEASURES_SUCCESS';
export const FETCH_MEASURES_FAILURE = 'FETCH_MEASURES_FAILURE';
export const RESET_MEASURES = 'RESET_MEASURES';

const ROOT_URL = window.oregonMeasureApp.apiUrl;

export function fetchMeasures() {
  const request = axios({
    method: 'get',
    url: `${ROOT_URL}/measure`
  });

  return {
    type: FETCH_MEASURES,
    payload: request
  }
}

export function fetchMeasuresSuccess(measures) {
  return {
    type: FETCH_MEASURES_SUCCESS,
    payload: measures
  }
}

export function fetchMeasuresFailure(error) {
  return {
    type: FETCH_MEASURES_FAILURE,
    payload: error
  }
}
