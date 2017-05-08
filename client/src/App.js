import React from 'react'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import axios from 'axios'
import {ChoroplethMap, ChoroplethMapKey, SummaryStatistics} from './ChoroplethMap'
import MeasureList from './MeasureList'
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
      measure_search_text: '',

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
   * Updates the measure search text so the top level can remember
   * what was search for when being directed to a different page
   *
   * @param measure_search_text string
   */
  updateMeasureSearchText(measure_search_text){
    this.setState({
      measure_search_text
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
              <MeasureList measures={self.state.measures_by_year} 
                search_text={this.state.measure_search_text}
                updateSearchText={this.updateMeasureSearchText.bind(this)}/>
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
                <ChoroplethMap
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


export default App
