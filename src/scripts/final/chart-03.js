// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

// creating svg
const margin = { top: 30, left: 50, right: 30, bottom: 40 }
const height = 130 - margin.top - margin.bottom
const width = 180 - margin.left - margin.right

const container = d3.select('#chart-03')

const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const line1 = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Total Applications'])
  })

const line2 = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Total Approvals'])
  })

const line3 = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Total Denials'])
  })

// Importing data
d3.csv(require('../../data/20companies.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  console.log(datapoints)

  // update scales

  xPositionScale.domain([2010, 2019])
  yPositionScale.domain([0, 20000])

  // Nesting
  const nested = d3
    .nest()
    .key(d => d.Employer)
    .entries(datapoints)

  // .sort(function(a, b) {
  //   return a.value - b.value
  // })

  console.log(nested)

  container
    .selectAll('svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      const svg = d3.select(this)
      const name = d.key
      const datapoints = d.values

      svg
        .append('path')
        .datum(datapoints)
        .attr('d', line1)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('class', 'applications')

      svg
        .append('text')
        .text(name)
        .attr('x', 8)
        .attr('y', -8)
        .attr('dx', -10)
        .attr('dy', 0)
        // .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'start')
        .style('font-size', 13)
        .attr('font-weight', 600)

      // Add  axes
      const xAxis = d3
        .axisBottom(xPositionScale)
        .tickFormat(d3.format('d'))
        .tickValues([2010, 2013, 2016, 2019])

      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      const yAxis = d3.axisLeft(yPositionScale).tickValues([0, 10000, 20000])

      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    })
}
