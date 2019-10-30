// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

// creating svg
const margin = { top: 70, left: 40, right: 20, bottom: 20 }
const height = 400 - margin.top - margin.bottom
const width = 720 - margin.left - margin.right

const svg = d3
  .select('#chart-05')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.key)
  })
  .y(function(d) {
    return yPositionScale(d.value)
  })
  .curve(d3.curveMonotoneX)

// Importing data
d3.csv(require('../../data/stockx.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(function(d) {
    d.SalePrice = +d['Sale Price'].replace(',', '').replace('$', '')
  })
  // Nesting data (with sort & rollup)
  const nested = d3
    .nest()
    .key(d => d['Shoe Size'])
    .rollup(values => d3.mean(values, v => v.SalePrice))
    .entries(datapoints)
    .sort(function(x, y) {
      return d3.ascending(+x.key, +y.key)
    })

  xPositionScale.domain([3, 17])
  yPositionScale.domain([100, 1200])

  svg
    .append('path')
    .datum(nested)
    .attr('d', line)
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 2)
    .attr('fill', 'none')

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('fill', 'skyblue')
    .attr('cx', function(d) {
      return xPositionScale(d.key)
    })
    .attr('cy', function(d) {
      return yPositionScale(d.value)
    })

  // create title
  svg
    .append('text')
    .text('Extreme sizes equal big bucks')
    .attr('text-anchor', 'middle')
    .attr('x', 150)
    .attr('y', -40)
    .attr('font-size', 25)
    .attr('font-weight', 600)

  svg
    .append('text')
    .text(
      'The average prices of sneaker go crazy when it comes to shoes with large sizes, and also the tiny ones.'
    )
    .attr('text-anchor', 'middle')
    .attr('x', 258)
    .attr('y', -20)
    .attr('font-size', 12)

  // axes
  const xAxis = d3.axisBottom(xPositionScale)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickFormat(d3.format('($,'))
    .tickValues([200, 400, 600, 800, 1000, 1200])
    .tickSize(-width)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.domain').remove()

  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'lightgrey')
    .call(yAxis)

  svg
    .selectAll('.x-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'none')
    .call(xAxis)
}
