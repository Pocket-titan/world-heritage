import React, { PureComponent } from 'react'
import GoogleMap from 'google-map-react'
import supercluster from 'points-cluster'

import MarkerComponent from './MarkerComponent'
import ClusterComponent from './ClusterComponent'
import MapControl from './MapControl'
import SearchBox from './SearchBox'
import RandomSiteButton from './RandomSiteButton'
import HelpButton from './HelpButton'

import apiKey from '../assets/js/apikey.js'
import mapStyle from '../assets/js/mapStyle.json'
import dangerList from '../assets/js/dangerList.json'

const markerData = require('../assets/js/whc-sites-2017.json')
  .map(site => ({
    title: site.name_en,
    lat: parseFloat(site.latitude),
    lng: parseFloat(site.longitude),
    category: site.category,
    id: parseInt(site.id_no, 10),
    danger: dangerList.some(danger_id => danger_id === site.id_no),
  }))
  .filter(marker => marker.lat && marker.lng)

class MapComponent extends PureComponent {
  static defaultProps = {
    options: {
      minZoom: 3,
      maxZoom: 15,
      streetViewControl: true,
      styles: mapStyle,
      clusterRadius: 40,
    },
    style: {
      width: '100%',
      height: '100%',
      margin: 0,
      padding: 0,
      display: 'flex',
      position: 'relative',
    },
    markers: markerData,
  }

  state = {
    clusters: [],
    center: {
      lat: 2.669,
      lng: 19.213,
    },
    zoom: 5,
    bounds: null,
  }

  getCluster = supercluster(this.props.markers, {
    minZoom: this.props.options.minZoom, // min zoom to generate clusters on
    maxZoom: this.props.options.maxZoom, // max zoom level to cluster the points on
    radius: this.props.options.clusterRadius, // cluster radius in pixels
  })

  onChange = ({ center, zoom, bounds }) => {
    this.setState({
      center,
      zoom,
      bounds,
      clusters: bounds
        ? this.getCluster({ center, zoom, bounds }).map(
            ({ wx, wy, numPoints, points }) => ({
              lat: wy,
              lng: wx,
              numPoints,
              points,
              id: `${numPoints}_${points.map(point => point.id).join('_')}`,
            }),
          )
        : [],
    })
  }

  panTo = ({
    lat,
    lng,
    callback = false,
    shouldZoom = false,
    shouldCenter = false,
  }) => {
    this.map &&
      (() => {
        const { map, maps } = this
        map.panTo({ lat, lng })
        shouldZoom && map.setZoom(13) // zoom to the closest level so the marker is def. not clustered
        !shouldCenter && map.panBy(0, -230) // make sure the infowindow is in sight
        callback && maps.event.addListenerOnce(map, 'idle', callback)
      })()
  }

  panToMarker = ({
    id,
    lat,
    lng,
    closeOpenMarker = false,
    shouldZoom = false,
  }) => {
    if (closeOpenMarker) {
      this.setState({ clickedMarkerId: -1 }, () => {
        this.panTo({
          lat,
          lng,
          callback: () => {
            this.setState({ clickedMarkerId: id })
          },
          shouldZoom,
        })
      })
      return
    }

    this.panTo({
      lat,
      lng,
      callback: () => {
        this.setState({ clickedMarkerId: id })
      },
      shouldZoom,
    })
  }

  panToRandomMarker = () => {
    const { props } = this
    const randomMarker =
      props.markers[Math.floor(Math.random() * props.markers.length)]
    this.panToMarker({
      ...randomMarker,
      id: `1_${randomMarker.id}`,
      closeOpenMarker: true,
      shouldZoom: true,
    })
  }

  onMapClick = clickObj => {
    // Important! all of our stuff has classNames, so if we click something without one, we
    // must have clicked the map, so we remove the open marker.
    if (
      clickObj.event.target.className === '' &&
      this.state.clickedMarkerId !== -1
    ) {
      this.setState({ clickedMarkerId: -1 })
    }
  }

  onMarkerClick = ({ id, lat, lng }) => {
    if (this.state.clickedMarkerId === id) {
      this.setState({ clickedMarkerId: -1 })
      return
    }
    this.panToMarker({
      id,
      lat,
      lng,
      closeOpenMarker: this.state.clickedMarkerId !== -1,
    })
  }

  onClusterClick = ({ lat, lng }) => {
    if (this.state.clickedMarkerId !== -1) {
      this.setState({ clickedMarkerId: -1 }, () => {
        this.panTo({ lat, lng, shouldCenter: true })
      })
      return
    }
    this.panTo({ lat, lng, shouldCenter: true })
  }

  onSearchResultClick = ({ id, lat, lng }) => {
    this.panToMarker({
      id: `1_${id}`,
      lat,
      lng,
      closeOpenMarker: this.state.clickedMarkerId !== -1,
      shouldZoom: true,
    })
  }

  render() {
    const { props } = this
    const { clusters } = this.state
    return (
      <GoogleMap
        bootstrapURLKeys={{ key: apiKey }}
        options={props.options}
        style={props.style}
        center={this.state.center}
        zoom={this.state.zoom}
        onChange={this.onChange}
        onClick={this.onMapClick}
        onGoogleApiLoaded={({ map, maps }) => {
          this.map = map
          this.maps = maps
          // we need this setState to force a mapcontrol render...
          this.setState({ mapControlShouldRender: true })
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        <MapControl
          map={this.map || null}
          controlPosition={
            this.maps ? this.maps.ControlPosition.TOP_LEFT : null
          }
        >
          <SearchBox
            data={props.markers}
            onResultClick={this.onSearchResultClick}
          />
        </MapControl>
        <MapControl
          map={this.map || null}
          controlPosition={
            this.maps ? this.maps.ControlPosition.TOP_LEFT : null
          }
        >
          <RandomSiteButton onClick={this.panToRandomMarker} />
        </MapControl>
        <MapControl
          map={this.map || null}
          controlPosition={
            this.maps ? this.maps.ControlPosition.TOP_LEFT : null
          }
        >
          <HelpButton />
        </MapControl>
        {clusters.map(markerProps => {
          const { id, numPoints, points } = markerProps

          return numPoints === 1 ? (
            <MarkerComponent
              key={id}
              {...points[0]}
              {...markerProps}
              clicked={this.state.clickedMarkerId === id}
              onClick={() =>
                this.onMarkerClick({
                  id,
                  lat: markerProps.lat,
                  lng: markerProps.lng,
                })
              }
            />
          ) : (
            <ClusterComponent
              key={id}
              {...markerProps}
              onClick={() =>
                this.onClusterClick({
                  lat: markerProps.lat,
                  lng: markerProps.lng,
                })
              }
            />
          )
        })}
      </GoogleMap>
    )
  }
}

export default MapComponent
