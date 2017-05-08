import * as d3 from "d3";
import chroma from 'chroma-js';
import React from 'react';
import './ChoroplethMap.css';


class ChoroplethMap extends React.Component {
  /**
   * Convience funciton
   */
  isFunction (prop) {
    return typeof prop === 'function'
  }

  /**
   * Given a number between 0 to 1 (percentage) return the bin
   * that this number belongs to
   */
  getColorBin(value, steps) {
    for(let x = 0; x < steps; x++){
      var low;

      if( x === 0){
        low = 0
      } else {
        low = x / steps
      }

      if( low <= value <= (x + 1) / steps){
        return x - 1 
      }
    }
  }

  getColor(d) {
    var value, colors, bin;

    if( this.isFunction(this.props.valueProperty) ){
      value = this.props.valueProperty(d)
    } else {
      value = d.properties[this.props.valueProperty]
    }

    if( this.props.colors ){
      colors = this.props.colors
    } else {
      colors = chroma.scale(this.props.scale).colors(this.props.steps)
    }

    bin = this.getColorBin(value, colors.length)

    return colors[bin]
  }

  /**
   * This is were we determine whether or not we need to draw the 
   * map again.
   *
   * @param prevProps Object
   */
  componentDidMount(prevProps){
    if(this.props.data !== undefined){
      if(this.props.data.length > 0){
        this.drawMap()
      }
    }
  }

  /**
   * This is were we determine whether or not we need to draw the 
   * map again.
   *
   * @param prevProps Object
   */
  componentDidUpdate(prevProps){
    if(this.props.data !== undefined){
      if(this.props.data.length > 0){
        this.drawMap()
      }
    }
  }

  /**
   * This function handles drawing the map with D3 js
   */
  drawMap(){
    var self = this;
    var tooltip = d3.select('#map-container .tooltip');

    var width = this.props.width,
        height = this.props.height;

    var projection = d3.geoMercator()
      .scale(this.props.scale)
      .center(this.props.center)
      .translate([width / 3, height / 3])

    var path = d3.geoPath()
      .projection(projection);

    // Set svg width & height
    var svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);
    
    svg.select('g').remove();

    if( this.props.data.length > 0 ){
      var mapLayer = svg.append('g')
        .classed('map-layer', true);

      // Draw each province as a path
      mapLayer.selectAll('path')
        .data(this.props.data)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .style('fill', self.getColor.bind(self))
        .style('line', 'white')
        .on('mousemove', function(d){
          var yes_text = 'Yes:';
          var no_text = 'No:';
          var total_votes = d.properties.yes_votes + d.properties.no_votes;
          var yes_percent = Math.round(
            d.properties.yes_votes / total_votes * 10000, 2
          ) / 100;
          var no_percent = Math.round(
            d.properties.no_votes / total_votes * 10000, 2
          ) / 100;

          var mouse = d3.mouse(svg.node()).map(function(d) {
            return parseInt(d);
          });

          d3.select(this).style('fill', '#DDD');

          if(d.properties.no_votes > d.properties.yes_votes){
            no_text = '<b>No:</b>';
          } else if( d.properties.yes_votes > d.properties.no_votes){
            yes_text = '<b>Yes:</b>';
          }

          tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 30) + 'px; top:' + (mouse[1] - 70) + 'px')
            .html('<div class="tooltip-title">'+ 
              d.properties.name+ 
            '</div>'+
            '<table class="">'+
              '<tr>'+
                '<td class="desc">'+yes_text+'</td>'+
                '<td class="total">'+d.properties.yes_votes.toLocaleString()+'</td>'+
                '<td class="percent">'+yes_percent+'%</td>'+
              '</tr>'+
              '<tr>'+
                '<td class="desc">'+no_text+'</td>'+
                '<td class="total">'+d.properties.no_votes.toLocaleString()+'</td>'+
                '<td class="percent">'+no_percent+'%</td>'+
              '</tr>'+
            '</table>'
            );
        })
        .on('mouseout', function(d){
          d3.select(this).style('fill', self.getColor.bind(self))
          tooltip.classed('hidden', true);
        })
    }
  }

  render(){
    return (
      <div id="map-container">
        <svg className="map"/>
        <div className="tooltip hidden"></div>
      </div>
    )
  }
}

/**
 * Display the choropleth map key
 */
class ChoroplethMapKey extends React.Component {
  render(){
    var breaks = [];

    for(var x = 1; x <= this.props.colors.length; x++){
      var step = Math.round((1 / this.props.colors.length) / 2 * 100);

      breaks.push(Math.round((x/this.props.colors.length) / 2 * 100 + 50 ) - step)
    }

    var break_divs = breaks.map(function(num, idx){
      var percent_sign;

      if(idx + 1 === breaks.length){
        percent_sign = '%'
      }

      return (
        <div key={idx} className="legend-number">{num}{percent_sign}</div>
      )
    })

    var color_divs = this.props.colors.map(function(obj, idx){
      var style = {
        'backgroundColor': obj,
      }

      return (
        <div style={style} className="legend-color" key={idx}/>
      )
    });

    return (
      <div className="legend">
        <div className="row legend-title">
          <div className="col-md-12">
            {this.props.title}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {color_divs.reverse()}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {break_divs}
          </div>
        </div>
      </div>
    )
  }
}

/**
 * Calculates the summary statistics for the data contained
 * within our geojson
 */
class SummaryStatistics extends React.Component {
  calculateSummaryStats(key){
    return this.props.data.reduce(function(acc, val){
      return acc + val.properties[key];
    }, 0);
  }

  render(){
    var passed, yes_check, no_check, yes_sp, no_sp;

    var yes_votes = this.calculateSummaryStats('yes_votes');
    var no_votes = this.calculateSummaryStats('no_votes');

    var per_yes = yes_votes / (no_votes + yes_votes) * 100;
    var per_no = no_votes / (no_votes + yes_votes) * 100;

    var yes_bar = {
      'width': per_yes + '%',     // Full green is the last one
      'backgroundColor': this.props.colors[this.props.colors.length - 1],
    }

    var no_bar = {
      'width': per_no + '%',
      'backgroundColor': this.props.colors[0]
    }

    var bold_text = {
      'fontWeight': 'bold'
    }

    if(yes_votes > no_votes){
      passed = 'Yes';
      yes_check = <span className="glyphicon glyphicon-ok" />;
      yes_sp = ' ';
    } else if(no_votes === yes_votes){
      passed = 'Tied'
    } else {
      passed = 'No'
      no_check = <span className="glyphicon glyphicon-ok" />;
      no_sp = ' ';
    }

    return (
      <div className="summary-statistics">
        <div className="title">
          Results
        </div>
        <div>
          {yes_check}{yes_sp}
          <span style={(passed === 'Yes') ? bold_text : {}}>Yes</span> {yes_votes.toLocaleString()}
          <div className="result-bar">
            <div className="result-color" style={yes_bar}>
            </div>
          </div>

          {no_check}{no_sp}
          <span style={(passed === 'No') ? bold_text : {}}>No</span> {no_votes.toLocaleString()}
          <div className="result-bar">
            <div className="result-color" style={no_bar}>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export {
  ChoroplethMap, 
  ChoroplethMapKey, 
  SummaryStatistics
}
