import React from 'react'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import axios from 'axios'
import {D3Map, ChoroplethMapKey, SummaryStatistics} from './D3Map'
import './App.css'

/**
 * Colors we use to build our choropleth map
 */

const colors = [
  '#b02029', // <-- Red
  '#cf635d',
  '#e99d98',
  '#bdd9a2',
  '#91b66e',
  '#66953d' // <-- Green
]

/**
 * Short description of this application
 */
const app_desc = 'An application for exploring ballot measures in Oregon. All'+
                 ' ballot measures since 1996 are available except years 2002 and 2007.'

class App extends React.Component {
  constructor(){
    super()
    this.state = {
      year: '',
      year_choices: [],
      measure: '',
      measure_choices: [],
      measure_descriptions: {},
      description: '',

      center_col_cls: 'col-md-7',
      left_col_cls: 'col-md-3',
      right_col_cls: 'col-md-2',

      /**
       * Holds the geo json to render
       */
      geojson: [],

      /**
       * Holds all measures organized from year.
       */
      measures_by_year: {},

      /**
       * Holds all the information about measure results by county
       */
      results: {},

      /**
       * Temp variable so we can reset the color of the feature as we 
       * mouse over and mouse out
       */
      current_feature_fill_color: '',

      /**
       * Holds all the layers we have requested so far
       */
      cached_layers: {}
    }

    var self = this;

    axios.get(
      '/json/geo.json'
    ).then(function(resp){
      var f_resp = resp

      axios.get(
        '/json/measures.json'
      ).then(function(resp){
        var measures = resp.data.measures;
        var results = resp.data.results;

        self.setState({
          measures_by_year: measures,
          year_choices: Object.keys(measures),
          year: Object.keys(measures)[0],
          results: results
        })

        self.setState({
          measure_choices: self.setMeasureChoices(measures, self.state.year)
        })

        self.setState({
          measure: self.state.measure_choices[0].measure
        })

        var geojson = self.updateGeoJson(f_resp.data.features)

        self.setState({geojson})

      })
    })
  }

  /**
   * This is where we determine whether or not we need to update
   * our geojson object
   */
  componentDidUpdate(prevProps, prevState){
    if( this.state.year && this.state.measure){
      if(this.state.year !== prevState.year || this.state.measure !== prevState.measure){
        this.setState({
          geojson: this.updateGeoJson(this.state.geojson)
        })
      }
    }
  }

  /**
   * Takes an object indexed by measure year and sets the
   * measure choices in a way suitable for MeasureSelector to
   * consume
   *
   * @param measures Object
   * @param year String
   *
   * @return measure_choices Array
   */
  setMeasureChoices(measures, year){
    var measure_choices = measures[year].map(function(x){
      return {
        measure: Number(x.measure),
        description: x.description
      };
    }).sort(function(a, b) {
      var x = a['measure']; var y = b['measure'];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    return measure_choices
  }

  /**
   * This method updates the provided geojson object with new values
   * depending on the current state values for year and measure.
   *
   * @param geojson Object
   * @param year String
   * @param measure String
   *
   * @return geojson Object
   */
  updateGeoJson(geojson){
    var self = this;

    geojson.map(function(obj){
      var result_key = self.state.year + '-' + 
          self.state.measure + '-' + 
          obj.properties.county_id;

      obj.properties.yes_votes = self.state.results[result_key]['yes_votes'];
      obj.properties.no_votes = self.state.results[result_key]['no_votes'];
      obj.properties.proportion = self.state.results[result_key]['proportion'];
    })

    return geojson
  }

  /**
   * This method will return the appropriate GeoJSON object given a year
   * and measure
   *
   * @param year String
   * @param measure String
   *
   * @return geojson Object
   */
  getGeoJson(year, measure){
    console.log(year, measure)

    var geojson = this.state.geojson;
    var results = this.state.results;

    geojson.map(function(obj){
      var result_key = year + '-' + measure + '-' + obj.properties.county_id;
      var county_results = results[result_key];

      obj.properties.yes_votes = results[result_key]['yes_votes'];
      obj.properties.no_votes = results[result_key]['no_votes'];
      obj.properties.proportion = results[result_key]['proportion'];
    });

    return geojson;
  }

  /**
   * This function updates the state property year. When you change the year,
   * we have a whole new set of values for measure, so we also account for 
   * that here.
   *
   * @param value String|Number
   */
  updateYear(value){
    var measure_choices = this.setMeasureChoices(
      this.state.measures_by_year, value
    )
    var measure = measure_choices[0].measure

    this.setState({measure})

    this.setState({
        year: value,
        measure_choices:  measure_choices,
    })
  }

  /**
   * This function updates the state value for measure
   *
   * @param String|Number
   */
  updateMeasure(value){
    this.setState({
      measure: value
    })
  }

  /**
   * Returns the measure description given a year and measure
   *
   * @param year String
   * @param measure String
   */
  getMeasureDescription(year, measure){
    var measures = this.state.measures_by_year[year]

    if(measures !== undefined){
      for(var x = 0; x < measures.length; x++){
        if(measures[x]['measure'] == measure){
          return measures[x]['description']
        }
      }
    }
  }

  /**
   * Rendering of the main app.
   */
  render(){
    var self = this;

    return (
      <Router>
        <div>
          <div className="row">
            <div className="col-md-12">
              <h1><Link to="/">Oregon Ballot Measures</Link></h1>
              <p>
                {app_desc}
              </p>
              <hr />
            </div>
          </div>

          <Route exact={true} path="/" render={() => (
            <div>
              <h2>Measure List</h2>
              <MeasureList measures={self.state.measures_by_year} />
            </div>
          )} />

          <Route path="/:year/:measure" render={({ match }) => (
            <div className="row map-container">
              <div className="search">
                <span className="search-text">
                  <Link to="/">Back to search</Link>
                </span>
              </div>
              <div className="col-md-4">
                <div className="map-title">
                  Measure {match.params.measure} &mdash; {match.params.year}
                </div>
                <hr />
                <SummaryStatistics data={self.getGeoJson(match.params.year, match.params.measure)} 
                  colors={colors}/>
                <hr />
                <div className="title">
                  Description
                </div>
                <p>
                  {this.getMeasureDescription(match.params.year, match.params.measure)}
                </p>
                <hr />

                <div className="title">
                  Legend
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <ChoroplethMapKey 
                      colors={colors.slice(0, Math.round(colors.length / 2))}
                      title="No Votes"
                    />
                  </div>
                  <div className="col-md-6">
                    <ChoroplethMapKey 
                      colors={colors.slice(Math.round(colors.length / 2), colors.length).reverse()}
                      title="Yes Votes"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <D3Map 
                  colors={colors} 
                  data={self.getGeoJson(match.params.year, match.params.measure)}
                  valueProperty={(feature) => feature.properties.proportion}
                  center={[-122, 45]}
                  height={475}
                  width={625}
                  scale={(600 * 700) / 100 }
                />

                <div className="row">
                  <div className="col-md-offset-3 col-md-3">
                  </div>
                  <div className="col-md-3">
                  </div>
                </div>

              </div>
            </div>
          )} />
        </div>
      </Router>
    )
  }
}


/**
 * View details and map for a single ballot measure
 */
class MeasureView extends React.Component {
  render(){
    return (
     <div className="row">
       <div className="col-md-7">
         <D3Map 
           colors={colors} 
           data={this.state.geojson}
           valueProperty={(feature) => feature.properties.proportion}
           center={[-122, 45]}
           height={475}
           width={625}
           scale={(600 * 700) / 100 }
         />
         <div className="row">
           <div className="col-md-offset-3 col-md-6">
             <ChoroplethMapKey colors={colors}/>
           </div>
         </div>
       </div>
       <div className="col-md-5">
         <div className="row">
           <div className="col-md-6">
             <SummaryStatistics data={this.state.geojson} colors={colors}/>
           </div>
           <div className="col-md-6">
             <div className="title">Election Year</div>
             <Select 
               choices={this.state.year_choices} 
               value={this.state.year} 
               change={this.updateYear.bind(this)} 
             />
           </div>
         </div>
         <hr />
         <div className="title">Ballot Measures</div>
         <MeasureSelector 
           choices={this.state.measure_choices} 
           value={this.state.measure}
           change={this.updateMeasure.bind(this)}/>
        </div>
      </div>
    )
  }
}


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


class MeasureSearch extends React.Component {
  render(){
    return (
      <div className="row">
        <div className="col-md-12">
           <Select 
             choices={this.props.year_choices} 
             value={this.props.year} 
             change={this.props.updateYear} 
           />
           <MeasureSelector 
             choices={this.props.measure_choices} 
             value={this.props.measure}
             change={this.props.updateMeasure}/>
        </div> 
      </div>
    )
  }
}

/**
 * Handles select for year specifically, but could be used as a
 * general select widget for anything else.
 */
class Select extends React.Component {
  constructor(props){
    super(props)
    var value = props.value;
    this.state = {value: value}
  }

  update(e){
    this.setState({value: e.target.value})
    this.props.change(e.target.value)
  }

  render(){
    var options = this.props.choices.map(function(choice){
      return <option key={choice} value={choice}>{choice}</option>
    })

    return (
      <select value={this.state.value} onChange={this.update.bind(this)}
        className="form-control">
        {options}
      </select>
    )
  }
}

/**
 * Special widget for selecting a ballot measure
 */
class MeasureSelector extends React.Component {
  constructor(){
    super();
    this.state = {value: undefined};
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.choices.length > 0 ){
      if(nextProps.value === undefined || nextProps.value !== this.props.value){
        this.setState({value: nextProps.value})
      }
    }
  }

  update(e){
    this.setState({value: e.target.dataset.value})
    this.props.change(e.target.dataset.value)
  }

  /**
   * Returns the appropriate classes to use for our <a> elements
   */
  getClasses(value){
    var className = 'measure-list-item'

    if(Number(this.state.value) === Number(value)){
      className += ' active'
    }

    return className
  }

  render(){
    var options = [];
    var choices = this.props.choices;

    for(var x = 0; x < choices.length; x++){
      options.push((
        <div className={"media " + this.getClasses(choices[x].measure)}
          key={choices[x].measure} 
        >
          <div className="measure-number media-left media-middle"
            onClick={this.update.bind(this)}
            data-value={choices[x].measure}
          >
            {choices[x].measure}
          </div>
          <div className="media-body"
            onClick={this.update.bind(this)}
            data-value={choices[x].measure}
          >
            {choices[x].description}
          </div>
        </div>
      ))
    }

    return (
      <div className="measure-list">
        {options}
      </div>
    )
  }
}

export default App
