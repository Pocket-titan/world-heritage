import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'

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
		const index = props.map.controls[props.controlPosition].getArray().indexOf(this.el)
		props.map.controls[props.controlPosition].removeAt(index)
	}

  _render() {
    const { props } = this
    if (!props.map || !props.controlPosition) return
    render(
      <div ref={el => {
        if (!this.renderedOnce) {
          this.el = el
          props.map.controls[props.controlPosition].push(el)
        } else if (el && this.el && el !== this.el) {
          this.el.innerHTML = '';
          [].slice.call(el.childNodes).forEach(child => this.el.appendChild(child))
        }
        this.renderedOnce = true
      }}>
        {props.children}
      </div>,
      document.createElement('div')
    )
  }

  render() {
    return <noscript/>
  }
}

export default MapControl
