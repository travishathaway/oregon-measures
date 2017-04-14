import * as d3 from "d3";
import chroma from 'chroma-js';


class D3Choropleth {
  mapCssClass = 'map-layer';

  constructor(props){
    this.props = props;
  }

  /**
   * Convience funciton
   */
  isFunction (prop) {
    return typeof prop === 'function'
  }

  /**
   * Given a number between 0 to 1 (percentage) return the bin
   * that this number belongs to
   *
   * @param value number value to derive bin from
   * @param steps number total number of steps (e.g. 5)
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

  /**
   * Give a object, d, find the appropriate color depending
   * on a this.props.valueProperty. This can either be a function
   * where d is passed in or a string.
   *
   * @param d object
   */
  getColor(d) {
    var value, colors, bin;

    if( this.isFunction(this.props.valueProperty) ){
      value = this.valueProperty(d)
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
   * Handle creating the initial DOM elements for our choropleth map
   *
   * @param el string, name of the root DOM element
   * @param props object, configuration properties used to create Map
   * @param state object, information about state
   */
  create(el, props, state){
    this.props = props;

    var svg = d3.select(el).append('svg')
      .attr('width', this.props.width)
      .attr('height', this.props.height);

    svg.append('g')
      .classed(self.mapCssClass, true);

    this.update(el, state);
  }

  update(el, state){
    var self = this;
    var svg = d3.select(el);
    var tooltip = d3.select('#map-container .tooltip');
    var dataUrl = this.props.dataUrl();

    d3.json(dataUrl, function(error, mapData) {
      if( mapData.length > 0 ){
        var mapLayer = svg.select('g');
        var features = mapData[0].features;
        var projection = d3.geoMercator()
          .scale(4000)
          // Center the Map in Oregon
          .center([-122, 45])
          .translate([self.props.width / 2, self.props.height / 2]);

        var path = d3.geoPath()
          .projection(projection);

        // Draw each province as a path
        mapLayer.selectAll('path')
          .data(features)
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
    });
  }

  destroy(el){
  }
}

export default D3Choropleth
