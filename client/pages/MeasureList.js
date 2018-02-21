import React, {Component} from 'react';
import Header from '../components/header';
import MeasureListContainer from '../containers/MeasureListContainer';

class MeasureList extends Component {
  render() {
    return (
      <div className="container">
        <Header />
        <MeasureListContainer />
      </div>
    )
  }
}

export default MeasureList;
