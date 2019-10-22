import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

// create svg
const container = d3
  .select('#chart-3b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// create scale
const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => d.data.high_temp * 0.8)

const pie = d3.pie().value(1 / 12)

const colorScale = d3.scaleLinear().range(['lightblue', 'pink'])

const xPositionScale = d3
  .scalePoint()
  .range([0 + margin.left, width - margin.right])
  .padding(0)

// import data
d3.csv(require('../../data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  const nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  // const cities = d3
  //   .map(datapoints, function(d) {
  //     return d.city
  //   })
  //   .keys()

  const cities = ['NYC', 'Tuscon', 'Lima', 'Beijing', 'Melbourne', 'Stockholm']

  xPositionScale.domain(cities)

  const temp = datapoints.map(d => +d.high_temp)
  const minTemp = d3.min(temp)
  const maxTemp = d3.max(temp)

  colorScale.domain([minTemp, maxTemp])

  container
    .selectAll('g')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(${xPositionScale(d.key)}, ${height / 2})`
    })
    .each(function(d) {
      const svg = d3.select(this)
      const name = d.key
      const datapoints = d.values

      // add wedges
      svg
        .selectAll('path')
        .data(pie(datapoints))
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .style('fill', function(d) {
          return colorScale(d.data.high_temp)
        })

      // center circle
      svg
        .append('circle')
        .attr('r', 2)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', 'grey')
        .raise()

      svg
        .append('text')
        .text(name)
        .attr('text-anchor', 'middle')
        .attr('y', height - 230)
    })
}
