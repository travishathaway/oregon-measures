import React from 'react'
import axios from 'axios'
import { Map, TileLayer } from 'react-leaflet'
import Choropleth from './Choropleth'
 
const style = {
    fillColor: '#F28F3B',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.75
}

const colors =[
 '#eb3326',
 '#f0624d',
 '#f58f76',
 '#fab8a0',
 '#ffddcc',
 '#ddffcc',
 '#b8faa0',
 '#8ff576',
 '#62f04d',
 '#33eb26'
]

const mapbox_api_token = 'pk.eyJ1IjoidGhhdGgiLCJhIjoiY2lsMnc1OW9yM2pqcXV5a3NtMXh3b3I4ZCJ9.Mn1daTFDAN18C38dOS0SjQ'

/**
 * This is the nice muted background
 */
const tile_layer_url = "http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=" + mapbox_api_token

class App extends React.Component {
  constructor(){
    super()
    this.state = {
      geojson: [],
      year: '',
      year_choices: [],
      measure: '',
      measure_choices: [],
      measures_by_year: [],
      measure_descriptions: {},
      description: '',

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

    var that = this

    axios.get(
      '/measure-by-year-all'
    ).then(function(resp){
      that.setState({
        measures_by_year: resp.data,
        year_choices: Object.keys(resp.data),
        year: Object.keys(resp.data)[0]
      })

      var measure_choices = []
      var measure_descriptions = []

      that.setState({
        measure_choices: that.setMeasureChoices(resp.data, that.state.year)
      })

      that.setState({
        measure: that.state.measure_choices[0].measure
      })
    })
  }

  componentDidMount(){
  }

  componentDidUpdate(prevProps, prevState){
    if( this.state.year && this.state.measure){
      if(this.state.year !== prevState.year || this.state.measure !== prevState.measure){
        this.updateMap()
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

  updateMap(){
    var that = this
    var current_layer = this.state.year + '-' + this.state.measure

    if(this.state.cached_layers[current_layer] !== undefined){
      this.setState({geojson: this.state.cached_layers[current_layer]})
    } else {
      axios.get(
        '/counties.json',
        {
          params: {
            measure: this.state.measure,
            year: this.state.year
          }
        }
      ).then(function(resp){
        that.setState({geojson: resp.data[0].features})
        that.setState(function(prevState){
          prevState.cached_layers[that.state.year + '-' + that.state.measure] = resp.data[0].features
          return prevState
        })
      })
    }
  }

  updateYear(value){
    var year = value
    var measure_choices = this.setMeasureChoices(
      this.state.measures_by_year, value
    )
    var measure = measure_choices[0].measure

    this.setState({
        year,
        measure_choices,
        measure
    })
  }

  updateMeasure(value){
    this.setState({
      measure: value
    })
  }

  highlightFeature(e){
    var layer = e.target;
    this.setState({currentFeatureColor: layer.options.fillColor});

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    layer.bringToFront();
  }

  resetHighlight(e){
    var layer = e.target;
    layer.setStyle(style);
  }

  render(){
    var that = this

    return (
      <div className="row">
        <div className="col-md-9">
          <Map center={this.props.position} zoom={7} id="map" doubleClickZoom={false}
            zoomControl={false} touchZoom={false} scrollWheelZoom={false}>
            <TileLayer url={tile_layer_url} id="mapbox.light" />
            <Choropleth
              data={this.state.geojson}
              valueProperty={(feature) => feature.properties.proportion}
              colors={colors}
              mode='q'
              style={style}
              onMouseOver={function(e){
                var layer = e.layer;
                that.setState({current_feature_fill_color: layer.options.fillColor});

                layer.setStyle({
                  weight: 5,
                  color: '#666',
                  dashArray: '',
                  fillOpacity: 0.7
                });

                layer.bringToFront();
              }}
              onMouseOut={function(e){
                var layer = e.layer;
                var tmp_style = style;
                tmp_style['fillColor'] = that.state.current_feature_fill_color;
                layer.setStyle(style);
              }}
              onEachFeature={function(feature, layer){
                layer.bindPopup(`
                  <b>${feature.properties.name}</b><br>
                  <b>Yes votes:</b> ${feature.properties.yes_votes}<br>
                  <b>No votes:</b> ${feature.properties.no_votes}<br>
                  <b>Proportion:</b> ${feature.properties.proportion}
                `)
              }}
              identity={function(feature){
                return that.state.year + '-' + that.state.measure + '-' + feature.properties.gid
              }}
            />
          </Map>
        </div>
        <div className="col-md-3">
          <h2>Oregon Measures</h2>
          <h4>Election Year</h4>
          <Select 
            choices={this.state.year_choices} 
            value={this.state.year} 
            change={this.updateYear.bind(this)} 
          />
          <hr />
          <h4>Ballot Measures</h4>
          <MeasureSelector 
            choices={this.state.measure_choices} 
            value={this.state.measure}
            year={this.state.year}
            change={this.updateMeasure.bind(this)}/>
        </div>
      </div>
    )
  }
}

class Select extends React.Component {
  constructor(){
    super()
    this.state = {value: ''}
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

class MeasureSelector extends React.Component {
  constructor(){
    super()
    this.state = {value: undefined}
  }

  componentWillReceiveProps(prevProps){
    if(this.props.choices.length > 0 ){
      if(this.state.value === undefined || this.props.year != prevProps.year){
        this.setState({value: this.props.choices[0].measure})
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
    var className = 'list-group-item'

    if(this.state.value == value){
      className += ' active'
    }

    return className
  }

  render(){
    var containerSyle = {
      height: '400px',
      overflowY: 'scroll'
    }

    var options = [];
    var choices = this.props.choices;

    for(var x = 0; x < choices.length; x++){
      options.push((
        <a href="#" 
          className={this.getClasses(choices[x].measure)} 
          key={choices[x].measure} 
          data-value={choices[x].measure}
          onClick={this.update.bind(this)}
        >
          Measure {choices[x].measure}<br/>
          {choices[x].description}
        </a>
      ))
    }

    return (
      <div className="list-group" style={containerSyle}>
        {options}
      </div>
    )
  }
}

export default App
