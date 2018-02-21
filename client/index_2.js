import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import configureStore from './store';
import MeasureDetail from './pages/MeasureDetail';
import MeasureList from './pages/MeasureList';

import './app.css';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={MeasureList} />
        <Route path="/measure/:year/:number" component={MeasureDetail} />
      </Switch>
    </BrowserRouter>
  </Provider>
, document.getElementById('app'));
