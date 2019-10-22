import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

// build svg
const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

// At the very least you'll need scales, and
// you'll need to read in the file. And you'll need
// and svg, too, probably.

const pie = d3.pie().value(function(d) {
  return d.minutes
})

const radius = 100

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)

const labelArc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius + 120)

const colorScale = d3.scaleOrdinal().range(['#BEC23F', '#9B90C2', '#F7C242'])

// import data
d3.csv(require('../../data/time-breakdown.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  svg
    .selectAll('path')
    .data(pie(datapoints))
    .enter()
    .append('path')
    .attr('d', d => arc(d))
    .attr('fill', d => colorScale(d.data.task))

  svg
    .selectAll('.outside-label')
    .data(pie(datapoints))
    .enter()
    .append('text')
    .text(function(d) {
      return d.data.task
    })
    // .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('transform', function(d) {
      return `translate(${labelArc.centroid(d)})`
    })
    .attr('text-anchor', function(d) {
      if (d.startAngle > Math.PI) {
        return 'end'
      } else {
        return 'start'
      }
    })
}
