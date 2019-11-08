import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 20, right: 20, bottom: 0 }

const height = 400 - margin.top - margin.bottom

const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// projection
const projection = d3.geoEqualEarth()
const path = d3.geoPath().projection(projection)

// import data
Promise.all([
  d3.json(require('/data/world.topojson')),
  d3.csv(require('/data/airport-codes-subset.csv')),
  d3.csv(require('/data/flights.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints, flights]) {
  const countries = topojson.feature(json, json.objects.countries)
  projection.fitSize([width, height], countries)

  // draw world map
  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)

  // draw sphere
  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', 'lightblue')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .lower()

  // draw circles
  svg
    .selectAll('.circles')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'circles')
    .attr('r', 2)
    .attr('transform', d => {
      const coords = projection([d.latitude, d.longitude])
      return `translate(${coords})`
    })
    .attr('fill', 'white')
    .raise()

  const coordinateStore = d3.map()

  datapoints.forEach(d => {
    const name = d.iata_code
    const coords = [d.latitude, d.longitude]
    coordinateStore.set(name, coords)
  })

  svg
    .selectAll('.lines')
    .data(flights)
    .enter()
    .append('path')
    .attr('d', function(d) {
      const fromCoords = ['-73.7781391', '40.6413111']
      const toCoords = coordinateStore.get(d.code)
      const geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-linecap', 'round')
}
