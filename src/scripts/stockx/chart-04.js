// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

// creating svg
const margin = { top: 20, left: 35, right: 20, bottom: 20 }
const height = 400 - margin.top - margin.bottom
const width = 720 - margin.left - margin.right

const svg = d3
  .select('#chart-04')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const colorScale = d3.scaleOrdinal().range(['#F9BF45', '#81C7D4'])

// Importing data
d3.csv(require('../../data/stockx.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  console.log(datapoints)

  // update scales

  const prices = datapoints.map(function(d) {
    return +d['Sale Price'].replace('$', '').replace(',', '')
  })

  const maxValue = d3.max(prices)
  const minValue = d3.min(prices)

  xPositionScale.domain([3, 15])
  yPositionScale.domain([minValue, maxValue])

  // d3.tip
  const tip = d3
    .tip()
    .attr('class', 'd3-tip-title')
    .offset([-5, 0])
    .html(function(d) {
      return `<span style='color:white; font-size:12px;'><strong>Sneaker:</strong> ${
        d['Sneaker Name']
      } <br> <strong>Size:</strong> ${d['Shoe Size']} <br><strong>Buyer Region:</strong> ${d['Buyer Region']}<br><strong>Sale Price:</strong> ${d['Sale Price']} </span></a>`
    })

  svg.call(tip)

  // add circle
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    // .attr('class', 'dots')
    .attr('fill', function(d) {
      return colorScale(d.Brand)
    })
    .attr('r', 3)
    .attr('cx', function(d) {
      return xPositionScale(d['Shoe Size'])
    })
    .attr('cy', function(d) {
      return yPositionScale(+d['Sale Price'].replace('$', '').replace(',', ''))
    })
    .raise()
    .attr('opacity', 0.5)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  const xAxis = d3.axisBottom(xPositionScale)

  // .ticks(6)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)

    .tickFormat(d3.format('($,'))
    .tickValues([1000, 2000, 3000, 4000])

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
    .attr('stroke', 'lightgrey')
    .call(xAxis)
}
