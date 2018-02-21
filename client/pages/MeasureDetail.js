import React, {Component} from 'react';
import Header from '../components/header';
import MeasureDetailContainer from '../containers/MeasureDetailContainer';

class MeasureDetail extends Component {
  render() {
    return (
      <div>
        <Header />
        <MeasureDetailContainer 
          year={this.props.match.params.year} 
          number={this.props.match.params.number}
        />
      </div>
    )
  }
}

export default MeasureDetail;
