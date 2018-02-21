import React from 'react'
import {Link} from 'react-router-dom'
import './css/measure.css'


/*
 * Measure list with search functionailty. We keep the master copy of measures
 * in props.measures and the visible measures are stored in a state
 * variable called `visible_measures`
 */
class MeasureList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      visible_measures: this.getVisibleMeasures(props.search_text, props.measures),
      search_text: props.search_text,
      style: {
        'display': 'block'
      },
      show_style: {
        'display': 'none'
      }
    }

    this.updateSearch = this.updateSearch.bind(this);
  }

  /**
   * Provided a `measures` object with measures keyed by year
   * return all measures that match `search_text` string provided.
   *
   * Example of `measures`:
   *  {
   *    1996: [
   *      {description: 'Something...', measure: 1},
   *      ...
   *    ]
   *    ...
   *  }
   *
   * @param search_text string
   * @param measures object
   *
   * @return object
   */
  getVisibleMeasures(search_text, measures){
    if(search_text != null || search_text != ''){
      var visible_measures = {}

      for(var year in measures){
        var year_measures = measures[year]
        var vis_year_measures = []

        for(var x = 0; x < year_measures.length; x++){
          var meas = year_measures[x]
          var desc = meas.description.toLowerCase()

          if(desc.search(search_text) > -1){
            vis_year_measures.push(meas)
          }
        }

        if( vis_year_measures.length > 0  && vis_year_measures != null ){
          visible_measures[year] = vis_year_measures
        }
      }

      return visible_measures

    } else {
      return this.props.measures
    }
  }

  updateSearch(e){
    this.setState({
      search_text: e.target.value
    })

    this.props.updateSearchText(e.target.value)
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      visible_measures: this.getVisibleMeasures(
        nextProps.search_text.toLowerCase(),
        nextProps.measures
      )
    })
  }

  /** 
   * Determines whether or not to include year in the current
   * list of measures to render.
   *
   * @param year number
   */
  isYearIncluded(year){
    var cur_years = this.props.categorical_filters['years']

    if(cur_years.indexOf(year) > -1){
      return true
    }

    if(cur_years.length === 0){
      return true
    }

    return false
  }

  render(){
    var self = this
    var years = Object.keys(this.state.visible_measures)
    var measures_by_year = this.state.visible_measures

    var grouped_item_list = years.map(function(year){
      var include_year = self.isYearIncluded(year)

      if( include_year ){
        var measures = measures_by_year[year]
        var measure_list = measures.map(function(meas){
          return (
            <div>
              <div className="measure-list-item row" key={year + ' ' + meas.measure}>
                <div className="measure-number col-md-2">
                  <Link to={`/measure/${year}/${meas.measure}`}>
                    {meas.measure}
                  </Link>
                </div>
                <div className="measure-description col-md-9">
                  {meas.description}
                </div>
              </div>
              <hr className="measure-list-item-sep"/>
            </div>
          )
        })

        return (
          <div key={year}>
            <div className="measure-list-item-year">{year}</div>
            <div>{measure_list}</div>
          </div>
        )
      }
    })

    if( grouped_item_list.length === 0 && Object.keys(this.props.measures).length > 0 ){
      grouped_item_list = (
        <h4>No Results</h4>
      )
    }

    return (
      <div>
        <div className="measure-list-container" style={this.state.style}>
          <div className="row">
            <div className="col-md-10 col-sm-12">
              <br />
              <input type="text" value={this.state.search_text} 
                onChange={this.updateSearch}
                className="form-control input-mdlg" placeholder="Search..."
              />
              <hr />
              <div className="measure-list">
                {grouped_item_list}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

/**
 * Renders all categorical filters used (e.g. "year", "special election", etc.)
 */
class MeasureCategoricalFilter extends React.Component {
  constructor(){
    super()
  }

  selectYear(e){
    var value = e.target.getAttribute('data-value')
    var years = this.props.categorical_filters['years']
    var value_idx = years.indexOf(value)
    var years = []

    //if(value_idx > -1){
    //  years.splice(value_idx, 1)
    //} else {
      years.push(value)
    //}

    this.props.updateCategoricalFilters(years, 'years')
  }


  getYearsHtml(){
    var self = this
    var years = Object.keys(this.props.measures)

    return years.map(function(year){
      var selected = (self.props.categorical_filters['years'].indexOf(year) > -1)
      var style = {}

      if(selected){
        style = {
          color: 'white',
          backgroundColor: 'green'
        }
      }

      return (
        <div key={year} style={style} data-value={year} 
          className="cat-tag"
          onClick={self.selectYear.bind(self)}>
          {year}
        </div>
      )
    })
  }

  render(){
    var years = this.getYearsHtml()

    return (
      <div>
        <h3>Election Years</h3>
        {years}
      </div>
    )
  }
}

export {
  MeasureList,
  MeasureCategoricalFilter
}
