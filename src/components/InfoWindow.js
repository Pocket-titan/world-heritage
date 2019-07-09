import React, { PureComponent } from 'react'

import Parser from 'html-react-parser'
import images from '../assets/js/images.js'
import captions from '../assets/js/imageCaptions.json'

const markerInformation = require('../assets/js/whc-sites-2018.json').reduce(
  (obj, site) => {
    if (!site.latitude || !site.longitude) {
      return obj
    }
    const information = {
      info: site.short_description_en,
      title: site.name_en,
      image_name: `${site.id_no}`,
      id: parseInt(site.id_no, 10),
    }
    obj[site.id_no] = information
    return obj
  },
  {},
)

class InfoWindow extends PureComponent {
  static defaultProps = {
    introStyle: {
      scale: 182,
      circleOffset: 100,
      arrowOffset: 0,
      arrowOpacity: 1,
      transition: 'all .5s linear',
      zIndex: 99,
      dataTransition: 'opacity 0.6s ease-in-out 0.3s',
    },
    outroStyle: {
      scale: 1,
      circleOffset: -10,
      arrowOffset: -10,
      arrowOpacity: 0,
      transition: 'all 0.7s ease-in-out',
      zIndex: 98,
      dataOpacity: 0,
      dataTransition: 'opacity 0.25s ease-in-out',
    },
  }

  state = {
    show: false,
    style: this.props.outroStyle,
    data: null,
  }

  _asyncLoadData = async () => {
    const { id } = this.props
    const marker = markerInformation[id]
    const [body, title, caption, image] = await Promise.all([
      Parser(marker.info),
      Parser(marker.title),
      Parser(captions[id]),
      images[id],
    ])
    console.log('body, title, caption, image', body, title, caption, image)
    this.setState(prevState => ({
      data: {
        body,
        title,
        caption,
        image,
      },
      style: {
        ...prevState.style,
        dataOpacity: 0,
      },
    }))
    setTimeout(
      () =>
        this.setState(prevState => ({
          // transition data in
          style: {
            ...prevState.style,
            dataOpacity: 1,
          },
        })),
      10,
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.mounted) {
      return this.unMountStyle()
    }

    !this.state.show &&
      (() => {
        // load the data if we weren't showing before
        this._asyncLoadData()
        this.setState({ show: true }) //remount the node when the mounted prop is true
        setTimeout(this.mountStyle, 10) //call the into animiation
      })()
  }

  mountStyle = () => {
    this.setState({ style: this.props.introStyle })
  }

  unMountStyle = () => {
    this.setState({ style: this.props.outroStyle })
  }

  transitionEnd = () => {
    if (!this.props.mounted) {
      this.setState({ show: false, data: null }) // set our data to null so we don't keep it in memory
    }
  }

  render() {
    const {
      scale,
      circleOffset,
      arrowOffset,
      arrowOpacity,
      transition,
      zIndex,
      dataOpacity,
      dataTransition,
    } = this.state.style
    return (
      this.state.show && (
        <div className="infowindow-container" style={{ transition, zIndex }}>
          <div className="infowindow">
            {this.state.data && (
              <div
                className="infowindow-inner"
                style={{ opacity: dataOpacity, transition: dataTransition }}
              >
                <div className="title-container">
                  <h1 className="title">{this.state.data.title}</h1>
                </div>
                <div className="content-container">
                  {this.state.data.image && (
                    <div className="image-and-caption-container">
                      <img
                        className="image"
                        src={this.state.data.image}
                        alt={this.state.data.caption}
                      />
                      <p
                        className="caption"
                        style={{
                          fontSize: (() => {
                            const length = this.state.data.caption.length
                            if (length <= 200) {
                              return 12.5
                            } else {
                              return 9
                            }
                          })(),
                        }}
                      >
                        {this.state.data.caption}
                      </p>
                    </div>
                  )}
                  <div className="body-and-link-container">
                    <span
                      className="body"
                      style={{
                        fontSize: (() => {
                          const { children } = this.state.data.body.props
                          console.log(
                            'this.state.data.body',
                            this.state.data.body,
                          )
                          if (children.length <= 600) {
                            return 15
                          } else if (children.length <= 950) {
                            return 13
                          } else {
                            return 12
                          }
                        })(),
                      }}
                    >
                      {this.state.data.body.props.children}
                    </span>
                    <a
                      className="link"
                      target="_blank"
                      href={`https://whc.unesco.org/en/list/${this.props.id}`}
                    >
                      More Information
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div
              className="circle"
              style={{
                transform: `scale(${scale})`,
                bottom: `${circleOffset}px`,
                transition,
              }}
              onTransitionEnd={this.transitionEnd}
            />
          </div>
          <span
            className="arrow"
            style={{
              transform: `translateY(${arrowOffset}px)`,
              opacity: arrowOpacity,
              transition,
            }}
          >
            ▼
          </span>
        </div>
      )
    )
  }
}

export default InfoWindow
