import React, {Component} from 'react';

import {SummaryStatistics, ChoroplethMap, ChoroplethMapKey} from './choropleth_map';

/**
 * Colors we use to build our choropleth map
 */

const COLORS = [
  '#b02029', // <-- Red
  '#cf635d',
  '#e99d98',
  '#bdd9a2',
  '#91b66e',
  '#66953d' // <-- Green
]

class MeasureDetail extends Component {
  componentWillMount() {
    this.props.fetchMeasure(this.props.year, this.props.number);
    this.props.fetchOregonGeojson();
  }

  getGeoJson() {
    const detail = this.props.measure.detail;
    const geojson = this.props.geojson.data;

    if (detail && geojson) {
        detail.results.sort(function(a, b) {
          return a.county_id - b.county_id;
        });

        geojson.features.sort(function(a, b) {
          return a.properties.county_id - b.properties.county_id;
        });

        geojson.features.map(function(obj) {
          for(let x = 0; x < detail.results.length; x++) {
            let county_id = detail.results[x].county_id;

            if ( county_id === obj.properties.county_id) {
              let yes_votes = detail.results[x].yes_votes;
              let no_votes = detail.results[x].no_votes;

              obj.properties.yes_votes = yes_votes;
              obj.properties.no_votes = no_votes;
              obj.properties.proportion = yes_votes / (yes_votes + no_votes);
              break;
            }
          }
        });

        return geojson.features;
    }

    return [];
  }

  render() {
    const self = this;
    const {detail, loading, error} = this.props.measure;
    const {data, g_loading, g_error} = this.props.geojson;

    if(loading) {
      return <div className="container"><h1>Posts</h1><h3>Loading...</h3></div> 
    } else if(error) {
      return <div className="alert alert-danger">Error: {error.message}</div>
    } else if(!detail) {
      return <span />;
    }

    return (
      <div className="row">
        <div className="col-md-offset-1 col-md-4 col-sm-12">
          <span className="map-title">Measure {detail.number}</span>
          <div className="pull-right">
            <span className="text-muted measure-year">{detail.year}</span>
          </div>
          <div className="clearfix"></div>
          <br />
          <p>
            {detail.description}
          </p>
          <hr />
          <SummaryStatistics data={self.getGeoJson()} 
            colors={COLORS}/>
          <hr />
          <div className="title">
            Legend
          </div>
          <div className="row">
            <div className="col-md-6">
              <ChoroplethMapKey 
                colors={COLORS.slice(0, Math.round(COLORS.length / 2))}
                title="No Votes"
              />
            </div>
            <div className="col-md-6">
              <ChoroplethMapKey 
                colors={COLORS.slice(Math.round(COLORS.length / 2), COLORS.length).reverse()}
                title="Yes Votes"
              />
            </div>
          </div>
        </div>

        <div className="col-md-7 col-sm-12 map-container">
          <ChoroplethMap
            colors={COLORS} 
            data={self.getGeoJson(detail.year, detail.number)}
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
    );
  }
}

export default MeasureDetail;
