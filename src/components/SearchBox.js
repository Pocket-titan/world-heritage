import React, { PureComponent } from 'react'

const lowerCaseIncludes = (one, two) => {
  return (one.toLowerCase().replace("<[^>]*>", "")).includes(two.toLowerCase())
}

class Search extends PureComponent {
  state = {
    value: '',
  }

  onChange = e => {
    let term = e.target.value
    this.setState({ value: term })
  }

  onResultClick = result => {
    this.setState({ value: '' })
    this.props.onResultClick({...result.coords, id: result.id})
  }

  render () {
    const { props } = this
    const { value } = this.state
    const results = value.length > 0
      ? props.data
          .filter(marker => lowerCaseIncludes(marker.title, value))
          .slice(0, 5)
          .map(marker => {
            const result = {
              title: marker.title.replace(/<[^>]*>/g, "").trim(),
              id: marker.id,
              coords: { lng: marker.lng, lat: marker.lat },
            }
            return { ...result, onClick: () => this.onResultClick(result)}
          })
      : []
    return (
      <div>
        {
          props.children({
            props: {value, onChange: this.onChange},
            results,
          })
        }
      </div>
    )
  }
}

const SearchBox = props => (
  <Search {...props}>
    {data => (
      <div className="search-component">
        <input
          {...data.props}
          type="text"
          placeholder="Search :D"
          className="search-box"
        />
        {
          data.results.map(result => (
              <div
                key={result.title}
                onClick={result.onClick}
                className="search-result"
              >
                {result.title}
              </div>
            )
          )
        }
        </div>
      )}
  </Search>
)

export default SearchBox
