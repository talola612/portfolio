// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
d3.tip = d3Tip

// creating svg
const margin = { top: 70, left: 20, right: 20, bottom: 20 }
const height = 400 - margin.top - margin.bottom
const width = 720 - margin.left - margin.right

const svg = d3
  .select('#chart-06')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3
  .scaleBand()
  .range([height, 0])
  .padding(0.2)

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

  const nested = d3
    .nest()
    .key(d => d['Sneaker Name'])
    .rollup(values => d3.mean(values, v => v.SalePrice))
    .entries(datapoints)
    .sort(function(x, y) {
      return d3.descending(+x.value, +y.value)
    })

  const filtered = nested.filter(function(d, i) {
    return i < 10
  })

  const ranked = filtered.sort(function(x, y) {
    return d3.ascending(+x.value, +y.value)
  })

  const names = ranked.map(function(d) {
    return d.key
  })

  xPositionScale.domain([0, 1900])
  yPositionScale.domain(names)

  svg
    .selectAll('rect')
    .data(ranked)
    .enter()
    .append('rect')
    .attr('y', function(d) {
      return yPositionScale(d.key)
    })
    .attr('height', yPositionScale.bandwidth())
    .transition()
    .duration(2000)
    .attr('width', function(d) {
      return xPositionScale(d.value)
    })
    .attr('fill', '#B5CAA0')

  svg
    .selectAll('text')
    .data(ranked)
    .enter()
    .append('text')
    .text(d => d.key.replace(/-/g, ' '))
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'hanging')
    .attr('x', 4)
    .attr('y', d => yPositionScale(d.key) + 5)
    .attr('font-size', 12)
    .attr('font-weight', 550)
    .attr('fill', 'white')
    .raise()

  // create title
  svg
    .append('text')
    .text('The most expensive sneakers on average')
    .attr('text-anchor', 'left')
    .attr('x', 5)
    .attr('y', -40)
    .attr('font-size', 25)
    .attr('font-weight', 600)

  svg
    .append('text')
    .text(
      'These 10 styles of sneakers are the most expensive ones out of all, and they are all Off-White.'
    )
    .attr('text-anchor', 'left')
    .attr('x', 5)
    .attr('y', -20)
    .attr('font-size', 12)

  svg
    .selectAll('.label')
    .data(ranked)
    .enter()
    .append('text')
    .attr('fill', 'grey')
    .attr('class', 'label')
    .attr('font-weight', 500)
    .attr('x', function(d) {
      return xPositionScale(d.value) + 6
    })
    .attr('y', function(d) {
      return yPositionScale(d.key) + 9
    })
    .transition()
    .duration(1000)
    .attr('dy', '.75em')
    .text(function(d) {
      return '$' + d.value.toFixed(0)
    })
    .attr('font-size', 12)
}
