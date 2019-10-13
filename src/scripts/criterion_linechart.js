import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 80, left: 50, right: 50, bottom: 50 }
const height = 350 - margin.top - margin.bottom
const width = 750 - margin.left - margin.right

const svg = d3
  .select('#linechart-01')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

// Create line var

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d.key)
  })
  .y(function(d) {
    return yPositionScale(+d.value)
  })
// .curve(d3.curveMonotoneX)

// Read in Data
d3.csv(require('../data/Criterion_collection.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  const filtered = datapoints.filter(function(d) {
    return d.year !== '' && +d.year !== 0
  })

  const nested = d3
    .nest()
    .key(d => +d.year)
    .rollup(function(v) {
      return v.length
    })
    .entries(filtered)
    .sort(function(x, y) {
      return d3.ascending(x.key, y.key)
    })

  const values = nested.map(function(d) {
    return d.value
  })

  const maxValue = d3.max(values)

  xPositionScale.domain([1920, 2019])
  yPositionScale.domain([0, maxValue + 5])

  // d3.tip
  const tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .html(function(d) {
      return `<span style='color:white'>${d.key}: </span> <span style='color:#CB4042'>${d.value}</span>`
    })

  svg.call(tip)

  // anootation

  // add anootation
  const annotations = [
    {
      note: {
        label: 'CC liscensed 38 films made in 1966'
      },
      connector: {
        end: 'arrow', // none, or arrow or dot
        type: 'line', // Line or curve
        points: 3, // Number of break in the curve
        lineType: 'horizontal'
      },
      data: { key: '1966', value: 33 },
      // y: 200,
      // x: 100,
      color: '#CB4042',
      dx: 50,
      dy: 50
    }
  ]

  const makeAnnotations = d3Annotation
    .annotation()
    .accessors({
      x: d => xPositionScale(d.key),
      y: d => yPositionScale(d.value)
    })
    .annotations(annotations)

  svg.call(makeAnnotations)

  // create line
  svg
    .append('path')
    .datum(nested)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.65)
    .raise()

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('fill', 'grey')
    .attr('r', 3)
    .attr('cx', function(d) {
      return xPositionScale(d.key)
    })
    .attr('cy', function(d) {
      return yPositionScale(d.value)
    })
    .raise()
    .attr('opacity', 0.65)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  // add title
  svg
    .append('text')
    .text('Count of film by the year of release')
    .attr('text-anchor', 'middle')
    .attr('x', 200)
    .attr('y', -40)
    .attr('fill', 'black')
    .attr('font-size', 25)
    .attr('font-weight', 'bold')

  svg
    .append('text')
    .text(
      'Criterion Collection appears to have a obvious affection for films made in the 60s'
    )
    .attr('x', -18)
    .attr('y', -20)
    .attr('fill', 'grey')
    .attr('font-size', 13)

  // add rect
  svg
    .append('rect')
    .attr('x', xPositionScale(1955))
    .attr('y', 0)
    .attr('width', xPositionScale(1975) - xPositionScale(1955))
    .attr('height', height)
    .attr('fill', 'lightgrey')
    .attr('opacity', 0.5)
    .lower()

  svg
    .append('text')
    .text('*1955-75: global art film')
    .attr('text-anchor', 'middle')
    .attr('dx', 290)
    .attr('y', 10)
    .attr('fill', 'grey')
    .attr('font-size', 9)

  svg
    .append('text')
    .text('movements')
    .attr('text-anchor', 'middle')
    .attr('dx', 270)
    .attr('y', 20)
    .attr('fill', 'grey')
    .attr('font-size', 9)

  // axes
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.format('d'))
    .tickSize(-height)
    .tickValues([1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010])

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .lower()
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.domain').remove()

  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'none')
    .call(yAxis)

  svg
    .selectAll('.x-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'lightgrey')
    .call(xAxis)
}
