import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import './css/measure.css';


class MeasureList extends Component {
  componentWillMount() {
    this.props.fetchMeasures(this.props.filters);
  }

  componentWillUnmount() {
    this.props.resetMeasures();
    this.props.resetFilters();
  }

  renderMeasures(measures) {

    return measures.map((meas) => {
      var passed = (
        <div className="text-danger">
          <div style="font-size: 2em">
            <span className="glyphicon glyphicon-remove"></span>
          </div>
          <strong>Not Passed</strong>
        </div>
      );

      if (meas.passed) {
        passed = (
          <div className="text-success">
            <div style="font-size: 2em">
              <span className="glyphicon glyphicon-ok"></span>
            </div>
            <strong>Passed</strong>
          </div>
        );
      }

      return (
        <div>
          <div className="measure-list-item row" key={meas.id}>
            <div className="measure-number col-md-2">
              <Link to={`/measure/${meas.year}/${meas.number}`}>
                {meas.number}
              </Link>
            </div>
            <div className="measure-description col-md-9">
              <div className="row">
                <div className="col-sm-11">
                  {meas.description}
                </div>
                <div className="col-sm-1">
                  {passed} 
                </div>
              </div>
            </div>
          </div>
          <hr className="measure-list-item-sep"/>
        </div>
      )
    });
  }

  render() {
    const {list, loading, error} = this.props.measures;
    var html = '';

    if(loading) {
      html = <div className="container"><h3>Loading...</h3></div> 
    } else if(error) {
      html = <div className="alert alert-danger">Error: {error.message}</div>
    } else {
      html = <ul className="list-group"> {this.renderMeasures(list)} </ul>
    }

    return (
      <div className="row">
        <div className="col-md-offset-1 col-sm-11">
          {html}
        </div>
      </div>
     );
  }
}

export default MeasureList;
