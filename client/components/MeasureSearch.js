import React, {Component} from 'react';


/**
 * Component that displays a search bar for searching through
 * measures
 */
class MeasureSearch extends Component {
  constructor() {
    super();
    this.state = {
      'searchTimeout': 0
    };
  }

  search() {
    this.props.resetMeasures();
    this.props.fetchMeasures(this.props.filters);
  }

  searchKeyUp(e) {
    this.props.setFilters({'search': e.target.value});

    if (e.charCode === 13 || e.keyCode === 13) {
      this.search()
    }
  }

  /**
   * Render search bar
   */
  render() {
    if( this.props.measures.loading ){
      var loading_text = 'Loading...';
    } else {
      var loading_text = '';
    }

    return (
      <div>
        <br />
        <div className="col-md-offset-1 col-md-10">
          <div className="input-group">
            <input className="form-control input-mdlg" placeholder="Search..." 
              onKeyUp={this.searchKeyUp.bind(this)} value={this.props.filters.search} />
            <div className="input-group-btn">
              <button className="btn btn-primary" onClick={this.search.bind(this)}>
                <span className="glyphicon glyphicon-search"></span>
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          {loading_text}
        </div>
      </div>
    )
  }
}

export default MeasureSearch;
