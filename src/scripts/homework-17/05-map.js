import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 150, right: 0, bottom: 0 }

const height = 600 - margin.top - margin.bottom

const width = 900 - margin.left - margin.right

const svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// US
const projection = d3.geoAlbersUsa()
const path = d3.geoPath().projection(projection)

// scales
const colorScale = d3
  .scaleOrdinal()
  .range([
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
    '#66c2a5'
  ])

const radiusScale = d3.scaleSqrt().range([0.5, 6])

Promise.all([
  d3.json(require('/data/us_states.topojson')),
  d3.csv(require('/data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  // get states
  const states = topojson.feature(json, json.objects.us_states)

  projection.fitSize([width, height], states)

  const allSources = d3
    .map(datapoints, function(d) {
      return d.PrimSource
    })
    .keys()
  colorScale.domain(allSources)

  const outputExtent = d3.extent(datapoints.map(d => d.Total_MW))
  radiusScale.domain(outputExtent)

  svg
    .selectAll('.states')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'states')
    .attr('d', path)
    .attr('fill', 'lightgrey')

  svg
    .selectAll('.circles')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'circles')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('transform', d => {
      const coords = projection([d.Longitude, d.Latitude])
      return `translate(${coords})`
    })
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', 0.5)
    .raise()

  console.log(states)
  svg
    .selectAll('.state-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .text(d => d.properties.abbrev)
    .attr('transform', d => {
      const coords = projection(d3.geoCentroid(d))
      return `translate(${coords})`
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 13)
    .style(
      'text-shadow',
      '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff'
    )

  console.log(colorScale)
  svg
    .selectAll('g')
    .data(colorScale.domain())
    .enter()
    .append('g')
    .each(function(d, i) {
      const g = d3.select(this)

      g.append('circle')
        .attr('r', 6)
        .attr('cx', -130)
        .attr('cy', 110 + i * 30)
        .attr('fill', colorScale(d))

      g.append('text')
        .text(d.charAt(0).toUpperCase() + d.slice(1))
        .attr('x', -120)
        .attr('y', 110 + i * 30)
        .attr('alignment-baseline', 'middle')
    })
}
