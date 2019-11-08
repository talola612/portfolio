import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 300 - margin.top - margin.bottom
const width = 330 - margin.left - margin.right

const container = d3.select('#chart-6')

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
  const outputExtent = d3.extent(datapoints.map(d => d.Total_MW))
  radiusScale.domain(outputExtent)

  const nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(datapoints)

  container
    .selectAll('svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      const svg = d3.select(this)
      const name = d.key
      const datapoints = d.values

      const states = topojson.feature(json, json.objects.us_states)
      projection.fitSize([width, height], states)

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

      svg
        .append('text')
        .text(name.charAt(0).toUpperCase() + name.slice(1))
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .attr('text-anchor', 'middle')
        // .attr('alignment-baseline', 'middle')
        .attr('font-size', 18)
        .style(
          'text-shadow',
          '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff'
        )
    })
}
