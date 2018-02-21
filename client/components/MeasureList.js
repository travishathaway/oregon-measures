import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import './css/measure.css';

class MeasureList extends Component {
  componentWillMount() {
    this.props.fetchMeasures();
  }

  renderMeasures(measures) {
    return measures.map((meas) => {
      return (
        <div>
          <div className="measure-list-item row" key={meas.id}>
            <div className="measure-number col-md-2">
              <Link to={`/measure/${meas.year}/${meas.number}`}>
                {meas.number}
              </Link>
            </div>
            <div className="measure-description col-md-9">
              {meas.description}
            </div>
          </div>
          <hr className="measure-list-item-sep"/>
        </div>
      )
    });
  }

  render() {
    const {list, loading, error} = this.props.measures;

    if(loading) {
      return <div className="container"><h1>Posts</h1><h3>Loading...</h3></div> 
    } else if(error) {
      return <div className="alert alert-danger">Error: {error.message}</div>
    }

    return (
      <div className="row">
        <div className="col-md-offset-1 col-md-10 col-sm-12">
          <ul className="list-group">
            {this.renderMeasures(list)}
          </ul>
        </div>
      </div>
     );
  }
}

export default MeasureList;
