// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
d3.tip = d3Tip

// creating svg
const margin = { top: 60, left: 35, right: 20, bottom: 20 }
const height = 400 - margin.top - margin.bottom
const width = 720 - margin.left - margin.right

const svg = d3
  .select('#chart-03')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])
const radiusScale = d3.scaleSqrt().range([3, 20])

const colorScale = d3.scaleOrdinal().range(['#F9BF45', '#66BAB7'])

const parseTime = d3.timeParse('%m/%d/%y')

// d3.tip
const tip = d3
  .tip()
  .attr('class', 'd3-tip-title')
  .offset([-5, 0])
  .html(function(d) {
    return `<span style='color:white; font-size:12px;'><strong>Sneaker:</strong> ${
      d.key
    } <br> <strong>Release Date:</strong> ${d.value.dateNum} <br> <strong>Avg Sale Price:</strong> $${d.value.avg.toFixed(2)}<br><strong>Total Number of Order:</strong> ${d.value.count}</span></a>`
  })

svg.call(tip)

// Importing data
d3.csv(require('../../data/stockx.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(function(d) {
    d.datetime = parseTime(d['Order Date'])
  })

  datapoints.forEach(function(d) {
    d.RetailPrice = +d['Retail Price'].replace(',', '').replace('$', '')
  })
  datapoints.forEach(function(d) {
    d.SalePrice = +d['Sale Price'].replace(',', '').replace('$', '')
  })

  const nested = d3
    .nest()
    .key(d => d['Sneaker Name'].replace(/-/g, ' '))
    .rollup(function(v) {
      return {
        count: v.length,
        max: d3.max(v, function(d) {
          return d.SalePrice
        }),
        avg: d3.mean(v, function(d) {
          return d.SalePrice
        }),
        date: d3
          .map(v, function(d) {
            return parseTime(d['Release Date'])
          })
          .keys()[0],
        dateNum: d3
          .map(v, function(d) {
            return d['Release Date']
          })
          .keys()[0],
        brand: d3
          .map(v, function(d) {
            return d.Brand
          })
          .keys()[0]
      }
    })
    .entries(datapoints)

  // update scales

  const minDate = parseTime('8/20/17')
  const maxDate = parseTime('3/1/19')

  const counts = nested.map(function(d) {
    return d.value.count
  })

  const minCount = d3.min(counts) - 200
  const maxCount = d3.max(counts) + 200

  xPositionScale.domain([minDate, maxDate])
  yPositionScale.domain([0, 2000])

  radiusScale.domain([minCount, maxCount])

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    // .attr('class', 'dots')
    .attr('fill', function(d) {
      return colorScale(d.value.brand)
    })
    .attr('r', d => radiusScale(d.value.count))
    .attr('cx', function(d) {
      return xPositionScale(Date.parse(d.value.date))
    })
    .attr('cy', function(d) {
      return yPositionScale(d.value.avg)
    })
    .raise()
    .attr('opacity', 0.5)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  // create title
  svg
    .append('text')
    .text('Rlease Date vs. Average Sale Value')
    .attr('text-anchor', 'middle')
    .attr('x', 180)
    .attr('y', -40)
    .attr('font-size', 25)
    .attr('font-weight', 600)

  svg
    .append('text')
    .text(
      'Number of transaction is marked by the size of the dot; hover to discover more details'
    )
    .attr('text-anchor', 'middle')
    .attr('x', 215)
    .attr('y', -20)
    .attr('font-size', 12)

  const brands = d3
    .map(nested, function(d) {
      return d.value.brand
    })
    .keys()

  // Handmade legend
  svg
    .append('circle')
    .attr('cx', 590)
    .attr('cy', 30)
    .attr('r', 6)
    .style('fill', '#F9BF45')
    .raise()

  svg
    .append('circle')
    .attr('cx', 590)
    .attr('cy', 0)
    .attr('r', 6)
    .style('fill', '#66BAB7')
    .raise()
  svg
    .append('text')
    .attr('x', 600)
    .attr('y', 30)
    .text(brands[0])
    .style('font-size', '15px')
    .attr('alignment-baseline', 'middle')
    .raise()

  svg
    .append('text')
    .attr('x', 600)
    .attr('y', 0)
    .text(brands[1])
    .style('font-size', '15px')
    .attr('alignment-baseline', 'middle')
    .raise()

  // axes
  const xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat('%Y-%m'))

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    .tickFormat(d3.format('($,'))

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .lower()
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
