import React from "react"

import Pillar from "../assets/images/Pillar.png"
import PillarDanger from "../assets/images/PillarDanger.png"
import Tree from "../assets/images/Tree.png"
import TreeDanger from "../assets/images/TreeDanger.png"
import Mixed from "../assets/images/Mixed.png"
import MixedDanger from "../assets/images/MixedDanger.png"

const HelpButton = (props) => (
  <div className="control-button" style={{ cursor: "help" }}>
    <i className="fa fa-question control-icon" style={{ marginRight: 1 }} />
    <div className="control-tooltip" style={{ width: 150 }}>
      <div className="legend-title">Legend</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.75fr",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          verticalAlign: "middle",
          columnGap: 5,
          rowGap: 0,
        }}
      >
        <div className="legend-icon-container">
          <img src={Pillar} alt="Cultural site" className="legend-icon" />
        </div>
        <div>
          <span className="legend-text">Cultural site</span>
        </div>

        <div className="legend-icon-container">
          <img src={Tree} alt="Natural site" className="legend-icon" />
        </div>
        <div>
          <span className="legend-text">Natural site</span>
        </div>

        <div className="legend-icon-container">
          <img src={Mixed} alt="Mixed site" className="legend-icon" />
        </div>
        <div>
          <span className="legend-text">Mixed site</span>
        </div>

        <div className="legend-icon-container">
          <img
            src={PillarDanger}
            alt="Endangered cultural site"
            className="legend-icon-small"
          />
          <img
            src={TreeDanger}
            alt="Endangered natural site"
            className="legend-icon-small"
          />
          <img
            src={MixedDanger}
            alt="Endangered mixed site"
            className="legend-icon-small"
          />
        </div>
        <div>Endangered sites</div>
      </div>
    </div>
  </div>
)

export default HelpButton
