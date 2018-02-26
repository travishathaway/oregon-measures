import axios from 'axios';

export const FETCH_MEASURES = 'FETCH_MEASURES';
export const FETCH_MEASURES_SUCCESS = 'FETCH_MEASURES_SUCCESS';
export const FETCH_MEASURES_FAILURE = 'FETCH_MEASURES_FAILURE';
export const RESET_MEASURES = 'RESET_MEASURES';

export const FETCH_MEASURE_YEARS = 'FETCH_MEASURE_YEARS';
export const FETCH_MEASURE_YEARS_SUCCESS = 'FETCH_MEASURE_YEARS_SUCCESS';
export const FETCH_MEASURE_YEARS_FAILURE = 'FETCH_MEASURE_YEARS_FAILURE';

export const SET_FILTERS = 'SET_FILTERS';
export const RESET_FILTERS = 'RESET_FILTERS';

const ROOT_URL = window.oregonMeasureApp.apiUrl;

/**
 * Fetches measures and allows for passing in search
 * terms
 *
 * @param search string
 *
 * @return object
 */
export function fetchMeasures(params) {
  const request = axios({
    method: 'get',
    url: `${ROOT_URL}/measure`,
    params: params
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


export function resetMeasures() {
  return {
    type: RESET_MEASURES,
    payload: []
  }
}


/**
 * Fetches all the years which we have measures for
 *
 * @param search string
 *
 * @return object
 */
export function fetchMeasureYears(params) {
  const request = axios({
    method: 'get',
    url: `${ROOT_URL}/measure/years`,
    params: params
  });

  return {
    type: FETCH_MEASURE_YEARS,
    payload: request
  }
}


export function fetchMeasureYearsSuccess(years) {
  return {
    type: FETCH_MEASURE_YEARS_SUCCESS,
    payload: years
  }
}


export function fetchMeasureYearsFailure(error) {
  return {
    type: FETCH_MEASURE_YEARS_FAILURE,
    payload: error
  }
}


/**
 * Updates the current search term
 *
 * @param search string
 *
 * @return object
 */
export function setFilters(search) {
  return {
    type: SET_FILTERS,
    payload: search
  }
}


export function resetFilters() {
  return {
    type: SET_FILTERS,
    payload: {}
  }
}
