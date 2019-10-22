import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

// create svg
const svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

// create scale
const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => d.data.high_temp * 1.5)

const pie = d3.pie().value(1 / 12)

const colorScale = d3.scaleLinear().range(['lightblue', 'pink'])

// import data
d3.csv(require('../../data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  // update scale
  const temp = datapoints.map(d => +d.high_temp)
  const minTemp = d3.min(temp)
  const maxTemp = d3.max(temp)
  colorScale.domain([minTemp, maxTemp])

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
    .attr('r', 3)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', 'grey')

  // add title
  svg
    .append('text')
    .text('NYC high temperatures, by month')
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -120)
    .style('font-size', 25)
    .attr('font-weight', '600')
}
