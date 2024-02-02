import React, { Component } from "react"
import PropTypes from "prop-types"
import { createPortal, render } from "react-dom"

export const useMapControl = (map, controlPosition, children) => {
  React.useEffect(() => {
    if (map && controlPosition) {
      render(
        <div ref={(el) => map.controls[controlPosition].push(el)}>
          {children}
        </div>,
        document.createElement("div")
      )
    }
    return () => {
      if (map && controlPosition) {
        map.controls[controlPosition].clear()
      }
    }
  }, [map, controlPosition])
}

class MapControl extends Component {
  static propTypes = {
    controlPosition: PropTypes.number,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.props.map && nextProps.map
  }

  componentDidMount() {
    this._render()
  }

  componentDidUpdate(prevProps, prevState) {
    this._render()
  }

  componentWillUnmount() {
    const { props } = this
    if (!props.map) return
    const index = props.map.controls[props.controlPosition]
      .getArray()
      .indexOf(this.el)
    props.map.controls[props.controlPosition].removeAt(index)
  }

  _render() {
    const { props } = this
    if (!props.map || !props.controlPosition) return
    render(
      <div
        onClick={() => {
          console.log("cli")
        }}
        ref={(el) => {
          console.log(`el`, el)

          if (!this.renderedOnce) {
            this.el = el
            props.map.controls[props.controlPosition].push(el)
          } else if (el && this.el && el !== this.el) {
            this.el.innerHTML = ""
            ;[].slice
              .call(el.childNodes)
              .forEach((child) => this.el.appendChild(child))
          }
          this.renderedOnce = true
        }}
      >
        {/* {props.children} */}
        <div
          style={{
            width: 100,
            height: 100,
            zIndex: 999999,
          }}
          onClick={() => {
            alert("clicked")
          }}
        >
          click me
        </div>
      </div>,
      document.createElement("div")
    )
  }

  render() {
    console.log(this.props)
    return <noscript />
  }
}

export default MapControl
