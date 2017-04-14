// Plot.js
/* global Plotly */
import React from 'react';

class MeasurePieChart extends React.Component {
  constructor(){
    super()
    this.state = {yes_votes: 0, no_votes: 0}
  }

  getNumVotes(type, data){
    var votes = 0;

    data.map(function(feature){
      if(feature.properties[type] !== undefined){
        votes += feature.properties[type];
      }
    })

    return votes
  }

  drawPlot() {
    var data = [{
      values: [
        this.state.yes_votes,
        this.state.no_votes
      ],
      labels: ['Yes Votes', 'No Votes'],
      type: 'pie',
      marker: {
        //       Green                      Red
        colors: ['rgba(51, 235, 38, 0.60)', 'rgba(235, 51, 38, 0.60)']
      },
    }];

    var layout = {
      title: 'Total Votes',
      width: 300,
      showlegend: false,
      hovermode: false
    };

    Plotly.newPlot('pie-chart', data, layout, {staticPlot: true})
  }


  componentWillReceiveProps(nextProps){
    if(nextProps.data.length > 0){
      if(nextProps.data !== this.props.data){
        var yes_votes = this.getNumVotes('yes_votes', nextProps.data)
        var no_votes = this.getNumVotes('no_votes', nextProps.data)

        this.setState({
          yes_votes,
          no_votes
        })
      }
    }
  }

  componentDidUpdate(){
    if(this.props.data.length > 0){
      this.drawPlot()
    }
  }

  componentDidMount() {
    if(this.props.data.length > 0){
      this.drawPlot()
    }
  }

  render() {
    return (
      <div>
        <table className="table table-bordered table-condensed">
          <tbody>
            <tr>
              <td><b>Yes Votes</b></td>
              <td>{this.state.yes_votes}</td>
            </tr>
            <tr>
              <td><b>No Votes</b></td>
              <td>{this.state.no_votes }</td>
            </tr>
          </tbody>
        </table>
        <div id="pie-chart"></div>
      </div>
    );
  }
}

export default MeasurePieChart;
