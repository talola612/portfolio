import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

// build container
const container = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// scales
const radius = 90

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)

const colorScale = d3.scaleOrdinal().range(['#BEC23F', '#9B90C2', '#F7C242'])

const xPositionScale = d3
  .scalePoint()
  .range([0 + margin.left * 2, width - margin.right * 2])

const pie = d3
  .pie()
  .value(function(d) {
    return d.minutes
  })
  .sort(function(a, b) {
    return a.task.localeCompare(b.task)
  })

// import data
d3.csv(require('../../data/time-breakdown-all.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const groups = d3
    .map(datapoints, function(d) {
      return d.project
    })
    .keys()

  xPositionScale.domain(groups)

  const nested = d3
    .nest()
    .key(d => d.project)
    .entries(datapoints)

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

      svg
        .selectAll('path')
        .data(pie(datapoints))
        .enter()
        .append('path')
        .attr('d', function(d) {
          return arc(d)
        })
        .attr('fill', function(d) {
          return colorScale(d.data.task)
        })

      svg
        .append('text')
        .text(name)
        .attr('text-anchor', 'middle')
        .attr('y', height - 200)
        .style('font-size', 15)
    })
}
