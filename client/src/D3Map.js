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
        height = this.props.height,
        centered;

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
          d3.select(this).style('fill', '#DDD');

          var mouse = d3.mouse(svg.node()).map(function(d) {
            return parseInt(d);
          });

          tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
            .html('<b>' + d.properties.name + '</b><br />Yes Votes: '+d.properties.yes_votes+
                '<br />No Votes: '+d.properties.no_votes
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

export default D3Map
