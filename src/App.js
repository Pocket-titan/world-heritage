import React, { Component } from 'react'
import { Unesco } from './assets/js/svgImages.js'
import MapComponent from './components/MapComponent'
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

const SVGIcon = props => {
  const svgString = props.svgString.toString()
  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgString }}
      style={props.style}
      fill={props.fill}
      className={props.className}
    />
  )
}

const Header = () => (
  <div className="header">
    <a
      rel="noopener noreferrer"
      className="header-menu left"
      target="_blank"
      href="http://www.unesco.org/"
    >
      Unesco
    </a>
    <div className="header-center">
      <SVGIcon
        svgString={Unesco}
        style={{
          transform: 'scale(0.2)',
          transformOrigin: 'left',
          width: '82px',
        }}
        className="unesco"
      />
      <div
        style={{
          flexDirection: 'column',
          textAlign: 'left',
          paddingLeft: 5,
          fontFamily: 'Montserrat',
        }}
      >
        <p style={{ marginBottom: 5 }}>World Heritage</p>
        <p style={{ marginTop: 5 }}>Interactive Map</p>
      </div>
    </div>
    <a
      rel="noopener noreferrer"
      className="header-menu right"
      target="_blank"
      href="http://whc.unesco.org/en/list/"
    >
      About
    </a>
  </div>
)

const Map = () => (
  <div className="map">
    <MapComponent />
  </div>
)

const Footer = () => (
  <div className="footer">
    made by{' '}
    <a className="mail" href="mailto:jelmargerritsen@gmail.com">
      jelmargerritsen@gmail.com
    </a>
  </div>
)

class App extends Component {
  componentDidMount() {
    document.title = 'World Heritage Map'
  }

  render() {
    return (
      <div className="page">
        <div className="bg" />
        <div className="content">
          <Header />
          <Map />
          <Footer />
        </div>
      </div>
    )
  }
}

export default App
