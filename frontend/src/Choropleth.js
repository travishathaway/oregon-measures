import React from 'react'
import chroma from 'chroma-js'
import { GeoJSON, LayerGroup} from 'react-leaflet'

class Choropleth extends React.Component {
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

  getColor(feature) {
    var value, colors, bin;

    if( this.isFunction(this.props.valueProperty) ){
      value = this.props.valueProperty(feature)
    } else {
      value = feature.properties[this.props.valueProperty]
    }

    if( this.props.colors ){
      colors = this.props.colors
    } else {
      colors = chroma.scale(this.props.scale).colors(this.props.steps)
    }

    bin = this.getColorBin(value, colors.length)

    return colors[bin]
  }

  getStyle(feature){
    var style = {}

    // Copy our intial style settings
    Object.assign(style, this.props.style)

    // Override with feature specific color
    style['fillColor'] = this.getColor(feature)

    return style
  }

  render(){
    const { layerContainer, identity, ...options } = this.props //remove 

    var features = this.props.data.map((feature, idx) =>
      (<GeoJSON
        key={(identity) ? identity(feature) : idx}
        {...options}
        style={this.getStyle(feature)}
        data={feature}
        children={this.props.children ? this.cloneChildrenWithFeature(this.props, feature) : this.props.children}
      />)
    )

    return (
      <LayerGroup map={this.props.map} layerContainer={layerContainer}>
        {features}
      </LayerGroup>
    )
  }
}

export default Choropleth

class GeoJsonUpdatable extends GeoJSON {
    componentWillReceiveProps(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.leafletElement.clearLayers();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.leafletElement.addData(this.props.data);
        }
    }
}

GeoJsonUpdatable.propTypes = {
    data: React.PropTypes.object.isRequired
}

