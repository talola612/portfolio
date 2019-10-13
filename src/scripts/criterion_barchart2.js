import * as d3 from 'd3'
import d3Tip from 'd3-tip'
d3.tip = d3Tip

const margin = { top: 80, left: 80, right: 50, bottom: 50 }
const height = 700 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#barchart-02')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3
  .scaleBand()
  .range([height, 0])
  .padding(0.2)

// Read in Data
d3.csv(require('../data/Criterion_collection.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  const filtered = datapoints.filter(function(d) {
    return d.year !== '' && +d.year !== 0 && d.spine != 0
  })

  const nestedCountry = d3
    .nest()
    .key(d => d.country)
    .rollup(function(v) {
      return v.length
    })
    .entries(filtered)
    .sort(function(a, b) {
      return b.value - a.value
    })
    .filter(function(d, i) {
      return i < 15
    })
    .sort(function(a, b) {
      return a.value - b.value
    })

  const continents = nestedCountry.map(function(d) {
    return d.key
  })
  const values = nestedCountry.map(function(d) {
    return d.value
  })
  const maxValue = d3.max(values)

  xPositionScale.domain([0, maxValue])
  yPositionScale.domain(continents)

  svg
    .selectAll('rect')
    .data(nestedCountry)
    .enter()
    .append('rect')
    .attr('class', 'bar2')
    .attr('y', function(d) {
      return yPositionScale(d.key)
    })
    .attr('height', yPositionScale.bandwidth())
    .transition()
    .duration(2000)
    .attr('width', function(d) {
      return xPositionScale(d.value)
    })
    .attr('fill', '#EEA9A9')

  // title
  svg
    .append('text')
    .text('Number of CC liscensed films by country (Top 15)')
    .attr('x', -50)
    .attr('y', -40)
    .attr('fill', 'black')
    .attr('font-size', 25)
    .attr('font-weight', 'bold')

  // sh
  svg
    .append('text')
    .text(
      'When diving into each continent and look at individual countries, something different is happening'
    )
    .attr('x', -48)
    .attr('y', -20)
    .attr('fill', 'black')
    .attr('font-size', 13)

  svg
    .selectAll('.label')
    .data(nestedCountry)
    .enter()
    .append('text')
    .attr('fill', 'grey')
    .attr('class', 'label')
    .attr('font-weight', 500)
    .attr('x', function(d) {
      return xPositionScale(d.value) + 6
    })
    .attr('y', function(d) {
      return yPositionScale(d.key) + 11
    })
    .transition()
    .duration(1000)
    .attr('dy', '.75em')
    .text(function(d) {
      return d.value
    })
    .attr('font-size', 12)

  // Add  axes
  const xAxis = d3.axisBottom(xPositionScale)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.domain').remove()

  svg
    .selectAll('.y-axis line')
    .attr('stroke', 'none')
    .call(yAxis)

  svg.selectAll('.x-axis line').attr('stroke', 'none')
}
