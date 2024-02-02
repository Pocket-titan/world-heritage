import React from "react"

import InfoWindow from "./InfoWindow"

import Pillar from "../assets/images/Pillar.png"
import PillarDanger from "../assets/images/PillarDanger.png"
import Tree from "../assets/images/Tree.png"
import TreeDanger from "../assets/images/TreeDanger.png"
import Mixed from "../assets/images/Mixed.png"
import MixedDanger from "../assets/images/MixedDanger.png"

const MarkerComponent = (props) => {
  const image = props.danger
    ? props.category === "Cultural"
      ? PillarDanger
      : props.category === "Natural"
      ? TreeDanger
      : MixedDanger
    : props.category === "Cultural"
    ? Pillar
    : props.category === "Natural"
    ? Tree
    : Mixed

  return (
    <div>
      <div className="marker-component" onClick={props.onClick}>
        <img alt={`${props.category} site`} src={image} className="marker" />
      </div>
      <InfoWindow mounted={props.clicked} id={props.id} />
    </div>
  )
}

export default MarkerComponent
