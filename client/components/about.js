import React from 'react'

/**
 * Super simple component that renders the about page
 */
class About extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-offset-2 col-md-8 col-sm-offset-1 col-sm-10">
          <h1>About</h1>
          <p>
            Oregon ballot measures is an application for exploring and researching
            the results of ballot measure initiatives.  For each ballot measure, we have
            the corresponding results broken down by county visible on a map.
          </p>
        </div>
      </div>
    )
  }
}

export default About
