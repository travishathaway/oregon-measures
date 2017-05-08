import React from 'react'
import {Link} from 'react-router-dom'


class MeasureList extends React.Component {
  constructor(){
    super()
    this.state = {
      search_text: '',
      style: {
        'display': 'block'
      },
      show_style: {
        'display': 'none'
      }
    }
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

  updateSearch(e){
    this.setState({
      search_text: e.value
    })

    this.state.measure
  }

  render(){
    var years = Object.keys(this.props.measures)
    var measures_by_year = this.props.measures

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
        <div style={this.state.show_stlye}>
          <a href="#" onClick={this.show.bind(this)}>Show</a>
        </div>
        <div className="measure-list-container" style={this.state.style}>
          <div>
            <div className="pull-right">
              <a href="#" onClick={this.hide.bind(this)} >Hide</a>
            </div>
            <input type="text" value={this.state.search_text} 
              onChange={this.updateSearch}
              className="form-control" placeholder="Search..."
            />
            <br/>
          </div>
          <div className="measure-list">
            {grouped_item_list}
          </div>
        </div>
      </div>
    )
  }
}

export default MeasureList
