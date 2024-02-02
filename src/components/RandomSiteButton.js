import React from "react"

const RandomSiteButton = (props) => (
  <div className="control-button" onClick={props.onClick}>
    <i className="fa fa-random control-icon" style={{ marginTop: 1 }} />
    <div className="control-tooltip" style={{ width: 70 }}>
      Random site
    </div>
  </div>
)

export default RandomSiteButton
