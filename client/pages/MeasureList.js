import React, {Component} from 'react';

import Header from '../components/header';
import MeasureListContainer from '../containers/MeasureListContainer';
import MeasureSearchContainer from '../containers/MeasureSearchContainer';
import MeasureYearsContainer from '../containers/MeasureYearsContainer';


class MeasureList extends Component {
  render() {
    return (
      <div className="container">
        <Header />
        <div className="row">
          <div className="col-md-offset-1 col-md-2">
            <MeasureYearsContainer />
          </div>
          <div className="col-md-8">
            <MeasureSearchContainer />
            <MeasureListContainer />
          </div>
        </div>
      </div>
    )
  }
}

export default MeasureList;
