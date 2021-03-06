import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 500 - margin.top - margin.bottom

const width = 900 - margin.left - margin.right

const svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// US projection
const projection = d3.geoAlbersUsa()
const path = d3.geoPath().projection(projection)

// color scales
const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([0, 1])

const opacityScale = d3
  .scaleLinear()
  .range([0, 1])
  .clamp(true)

// import
Promise.all([
  d3.json(require('/data/counties_with_election_data.topojson')),
  d3.json(require('/data/counties.topojson'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, maine]) {
  // get counties
  const counties = topojson.feature(json, json.objects.us_counties)
  const maineCounties = topojson.feature(maine, maine.objects.elpo12p010g)
  maineCounties.features = maineCounties.features.filter(
    d =>
      d.properties.STATE === 'ME' ||
      d.properties.STATE === 'NH' ||
      d.properties.STATE === 'VT'
  )

  // fix map size
  projection.fitSize([width, height], counties)

  opacityScale.domain([0, 50000])

  // build  map
  svg
    .selectAll('.counties')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', function(d) {
      const total = d.properties.trump + d.properties.clinton
      const clinton = d.properties.clinton / total
      return colorScale(clinton)
    })
    .attr('opacity', d =>
      opacityScale(d.properties.trump + d.properties.clinton)
    )

  svg
    .selectAll('.maine')
    .data(maineCounties.features)
    .enter()
    .append('path')
    .attr('class', 'maine')
    .attr('d', path)
    .attr('fill', function(d) {
      const total = d.properties.OBAMA + d.properties.ROMNEY
      const r = d.properties.OBAMA / total
      return colorScale(r)
    })
    .attr('opacity', d =>
      opacityScale(d.properties.OBAMA + d.properties.ROMNEY)
    )
}
