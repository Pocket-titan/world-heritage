import React from 'react'
import colormap from 'colormap'

const customColorMap = [
  {index: 0, rgb: [144, 164, 224]},
  {index: 1, rgb: [66, 85, 132]},
]

const range = [2, 4, 5, 7, 10, 15, 20, 30, 50, 75, 100]

const colors = colormap({
  colormap: customColorMap,
  nshades: range.length,
  format: 'rgb',
  alpha: 1,
})

const getColor = number => {
  const index = range.findIndex((maxNumber) => number <= maxNumber)
  return colors[index]
}

const getBackgroundColor = (numPoints) => {
  if (!numPoints) return
  const [r, g, b] = getColor(numPoints)
  return `rgb(${r}, ${g}, ${b})`
}

const getBorder = (numPoints, darken = 40) => {
  if (!numPoints) return
  const [r, g, b] = getColor(numPoints).map(val => Math.abs(val - darken))
  return `2px solid rgb(${r}, ${g}, ${b})`
}

const ClusterComponent = props => (
  <div className="cluster-component" onClick={props.onClick}>
    <div
      className="cluster"
      style={{backgroundColor: getBackgroundColor(props.numPoints), border: getBorder(props.numPoints)}}>
      <span className="cluster-text">
        {props.numPoints}
      </span>
    </div>
  </div>
)

export default ClusterComponent
