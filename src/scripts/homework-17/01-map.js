import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 500 - margin.top - margin.bottom

const width = 900 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// projection & graticule
const projection = d3.geoMercator()
const path = d3.geoPath().projection(projection)
const graticule = d3.geoGraticule()

// scale
const colorScale = d3
  .scaleSequential(d3.interpolateViridis)
  .domain([0, 500000])
  .clamp(true)

// importing data
Promise.all([
  d3.json(require('/data/world.topojson')),
  d3.csv(require('/data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  const countries = topojson.feature(json, json.objects.countries)

  // const population = datapoints.map(d => d.population)
  // colorScale.domain(d3.extent(population))
  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#080808')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'grey')
    .lower()

  svg
    .selectAll('.circles')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'circles')
    .attr('r', 1)
    .attr('transform', d => {
      const coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })
    .attr('fill', d => colorScale(d.population))
    .raise()

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#black')
    .lower()
}
