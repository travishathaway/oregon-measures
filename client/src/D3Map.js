import * as d3 from "d3";
import chroma from 'chroma-js';
import React from 'react';
import styles from './D3Map.css';


class D3Map extends React.Component {
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
   * map again. We rely on the "dataUrl" parameter provided as a 
   * property to uniquely identify 
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

    // TODO: generalize this to all for other centering options
    var projection = d3.geoMercator()
      .scale(this.props.scale)
      // Center the Map in Oregon
      .center(this.props.center)
      .translate([width/3, height/3])
      //.translate([width / 2, height / 2]);

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
        .on('mouseover', function(d){
          var yes_text = 'Yes:';
          var no_text = 'No:';

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
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
            .html('<div class="tooltip-title">' + d.properties.name + '</div>'+yes_text+' '+
              d.properties.yes_votes.toLocaleString()+'<br />'+no_text+' '+
              d.properties.no_votes.toLocaleString()
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
    var self = this;

    var color_divs = this.props.colors.map(function(obj, idx){
      var text = '';
      var width_per = (1 / self.props.colors.length) * 100;
      var style = {
        'backgroundColor': obj,
        'height': '15px',
        'width': width_per + '%'
      }

      if(idx === 0){
        text = 'No';
      } else if(idx === self.props.colors.length - 1){
        text = 'Yes';
      }

      return (
        <div style={style} className="pull-left" key={idx}/>
      )
    });
    return (
      <div className="legend">
        <div className="row">
          <div className="col-md-12">
            {color_divs.reverse()}
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="pull-left">
              <b>Yes</b>
            </div>

            <div className="pull-right">
              <b>No</b>
            </div>
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
    var passed, yes_check, no_check;

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
    } else if(no_votes === yes_votes){
      passed = 'Tied'
    } else {
      passed = 'No'
      no_check = <span className="glyphicon glyphicon-ok" />;
    }

    return (
      <div className="summary-statistics">
        <div className="title">
          Summary
        </div>
        <div>
          {yes_check}
          <span style={(passed === 'Yes') ? bold_text : {}}>Yes</span> {yes_votes.toLocaleString()}
          <div className="result-bar">
            <div className="result-color" style={yes_bar}>
            </div>
          </div>

          {no_check}&nbsp;
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
  D3Map, 
  ChoroplethMapKey, 
  SummaryStatistics
}
