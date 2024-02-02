import React, { PureComponent } from "react"
import GoogleMap from "google-map-react"
import supercluster from "points-cluster"
import ReactDOM from "react-dom"

import MarkerComponent from "./MarkerComponent"
import ClusterComponent from "./ClusterComponent"
import MapControl, { useMapControl } from "./MapControl"
import SearchBox from "./SearchBox"
import RandomSiteButton from "./RandomSiteButton"
import HelpButton from "./HelpButton"

import apiKey from "../assets/js/apikey.js"
import mapStyle from "../assets/js/mapStyle.json"
import dangerList from "../assets/js/dangerList.json"

const markerData = require("../assets/js/whc-sites.json")
  .map((site) => ({
    title: site.name_en,
    lat: parseFloat(site.latitude),
    lng: parseFloat(site.longitude),
    category: site.category,
    id: parseInt(site.id_no, 10),
    danger: dangerList.some((danger_id) => danger_id === site.id_no),
  }))
  .filter((marker) => marker.lat && marker.lng)

const renderControl = (map, maps, Component, position, props) => {
  const controlButtonDiv = document.createElement("div")
  ReactDOM.render(<Component {...props} />, controlButtonDiv)
  map.controls[position].push(controlButtonDiv)
}

const defaultProps = {
  options: {
    minZoom: 3,
    maxZoom: 15,
    streetViewControl: true,
    styles: mapStyle,
    clusterRadius: 40,
  },
  style: {
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    display: "flex",
    position: "relative",
  },
  markers: markerData,
}

const MapComponent = (props) => {
  const { options, style, markers } = { ...defaultProps, ...props }
  const [clickedMarkerId, setClickedMarkerId] = React.useState(-1)
  const [center, setCenter] = React.useState({ lat: 2.669, lng: 19.213 })
  const [clusters, setClusters] = React.useState([])
  const [bounds, setBounds] = React.useState(null)
  const [zoom, setZoom] = React.useState(5)
  const maps = React.useRef(null)
  const map = React.useRef(null)

  const getCluster = React.useMemo(
    () =>
      supercluster(markers, {
        minZoom: options.minZoom, // min zoom to generate clusters on
        maxZoom: options.maxZoom, // max zoom level to cluster the points on
        radius: options.clusterRadius, // cluster radius in pixels
      }),
    []
  )

  const onChange = ({ center, zoom, bounds }) => {
    setCenter(center)
    setZoom(zoom)
    setBounds(bounds)
    setClusters(
      bounds
        ? getCluster({ center, zoom, bounds }).map(
            ({ wx, wy, numPoints, points }) => ({
              lat: wy,
              lng: wx,
              numPoints,
              points,
              id: `${numPoints}_${points.map((point) => point.id).join("_")}`,
            })
          )
        : []
    )
  }

  const panTo = ({
    lat,
    lng,
    callback = false,
    shouldZoom = false,
    shouldCenter = false,
  }) => {
    map.current &&
      (() => {
        map.current.panTo({ lat, lng })
        shouldZoom && map.current.setZoom(13) // zoom to the closest level so the marker is def. not clustered
        !shouldCenter && map.current.panBy(0, -230) // make sure the infowindow is in sight
        callback &&
          maps.current.event.addListenerOnce(map.current, "idle", callback)
      })()
  }

  const panToMarker = ({
    id,
    lat,
    lng,
    closeOpenMarker = false,
    shouldZoom = false,
  }) => {
    if (closeOpenMarker) {
      setClickedMarkerId(-1)

      panTo({
        lat,
        lng,
        callback: () => {
          setClickedMarkerId(id)
        },
        shouldZoom,
      })

      return
    }

    panTo({
      lat,
      lng,
      callback: () => {
        setClickedMarkerId(id)
      },
      shouldZoom,
    })
  }

  const panToRandomMarker = () => {
    const randomMarker = markers[Math.floor(Math.random() * markers.length)]

    panToMarker({
      ...randomMarker,
      id: `1_${randomMarker.id}`,
      closeOpenMarker: true,
      shouldZoom: true,
    })
  }

  const onMapClick = (clickObj) => {
    // Important! all of our stuff has classNames, so if we click something without one, we
    // must have clicked the map, so we remove the open marker.
    if (clickObj.event.target.className === "" && clickedMarkerId !== -1) {
      setClickedMarkerId(-1)
    }
  }

  const onMarkerClick = ({ id, lat, lng }) => {
    if (clickedMarkerId === id) {
      setClickedMarkerId(-1)
      return
    }

    panToMarker({
      id,
      lat,
      lng,
      closeOpenMarker: clickedMarkerId !== -1,
    })
  }

  const onClusterClick = ({ lat, lng }) => {
    if (clickedMarkerId !== -1) {
      setClickedMarkerId(-1)

      panTo({ lat, lng, shouldCenter: true })

      return
    }

    panTo({ lat, lng, shouldCenter: true })
  }

  const onSearchResultClick = ({ id, lat, lng }) => {
    panToMarker({
      id: `1_${id}`,
      lat,
      lng,
      closeOpenMarker: clickedMarkerId !== -1,
      shouldZoom: true,
    })
  }

  return (
    <GoogleMap
      bootstrapURLKeys={{ key: apiKey }}
      options={{
        ...(options || {}),
        gestureHandling: "greedy",
      }}
      style={style}
      center={center}
      zoom={zoom}
      onChange={onChange}
      onClick={onMapClick}
      onGoogleApiLoaded={({ map: _map, maps: _maps }) => {
        map.current = _map
        maps.current = _maps

        renderControl(_map, _maps, SearchBox, _maps.ControlPosition.TOP_LEFT, {
          data: markers,
          onResultClick: onSearchResultClick,
        })

        renderControl(
          _map,
          _maps,
          RandomSiteButton,
          _maps.ControlPosition.TOP_LEFT,
          { onClick: panToRandomMarker }
        )

        renderControl(
          _map,
          _maps,
          HelpButton,
          _maps.ControlPosition.TOP_LEFT,
          {}
        )

        // we need this setState to force a mapcontrol render...
        // this.setState({ mapControlShouldRender: true })
      }}
      yesIWantToUseGoogleMapApiInternals
    >
      {clusters.map((cluster) => {
        const { id, numPoints, points } = cluster

        return numPoints === 1 ? (
          <MarkerComponent
            key={id}
            {...points[0]}
            {...cluster}
            clicked={clickedMarkerId === id}
            onClick={() =>
              onMarkerClick({
                id,
                lat: cluster.lat,
                lng: cluster.lng,
              })
            }
          />
        ) : (
          <ClusterComponent
            key={id}
            {...cluster}
            onClick={() =>
              onClusterClick({
                lat: cluster.lat,
                lng: cluster.lng,
              })
            }
          />
        )
      })}
    </GoogleMap>
  )
}

export default MapComponent
