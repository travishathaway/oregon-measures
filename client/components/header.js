import React, {Component} from 'react';
import {Link} from 'react-router-dom'

import './css/header.css';

class Header extends Component {
  render() {
    return (
      <div className="row site-header">
        <div className="col-md-offset-1 col-md-10 col-sm-12">
          <div className="pull-right site-menu">
            <div className="site-menu-link">
              <Link to="/about">About</Link>
            </div>
            <div className="site-menu-link">
              <Link to="/">Search</Link>
            </div>
          </div>
          <div className="site-title">
            <Link to="/">Oregon Ballot Measures</Link>
          </div>
          <hr />
        </div>
      </div>
    )
  }
}

export default Header
