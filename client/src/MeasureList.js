import React from 'react'
import {Link} from 'react-router-dom'
import './MeasureList.css'


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
  hide(){
    this.props.updateColWidth('no_search')
    this.setState({
      style: {'display': 'none'},
      show_style: {'display': 'block'}
    })
  }

  show(){
    this.props.updateColWidth('search')
    this.setState({
      style: {'display': 'block'},
      show_style: {'display': 'none'}
    })
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

  render(){
    var years = Object.keys(this.state.visible_measures)
    var measures_by_year = this.state.visible_measures

    var grouped_item_list = years.map(function(year){
      var measures = measures_by_year[year]
      var measure_list = measures.map(function(meas){
        return (
          <div key={year + ' ' + meas.measure}>
            <div className="measure-list-item">
              <div>
                <Link to={`/${year}/${meas.measure}`}>
                  Measure {meas.measure}
                </Link>
              </div>
              {meas.description}
            </div>
          </div>
        )
      })

      return (
        <div key={year}>
          <div className="measure-list-item-year">{year}</div>
          <div>{measure_list}</div>
        </div>
      )
    })

    return (
      <div>
        <div className="measure-list-container" style={this.state.style}>
          <div className="row">
            <div className="col-md-5 col-sm-12">
              <input type="text" value={this.state.search_text} 
                onChange={this.updateSearch}
                className="form-control" placeholder="Search..."
              />
            </div>
          </div>
          <br />
          <div className="measure-list">
            {grouped_item_list}
          </div>
        </div>
      </div>
    )
  }
}

export default MeasureList
