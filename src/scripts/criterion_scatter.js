import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 110, left: 50, right: 50, bottom: 50 }
const height = 500 - margin.top - margin.bottom
const width = 750 - margin.left - margin.right

const svg = d3
  .select('#scatterplot-01')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range(['#E87A90', '#FFC408', '#33A6B8', '#7BA23F', '#986DB2', '#ED784A'])

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
    return d.year !== '' && +d.year !== 0 && d.spine != 0
  })

  console.log(filtered)

  const continent = d3
    .map(filtered, function(d) {
      return d.continent
    })
    .keys()

  xPositionScale.domain([1920, 2019])
  yPositionScale.domain([0, 1000])

  // d3.tip
  const tip = d3
    .tip()
    .attr('class', 'd3-tip-title')
    .offset([-5, 0])
    .html(function(d) {
      return `<span style='color:white; font-size:12px;'><strong>Director:</strong> ${d.director} <br> <strong>Film:</strong> ${d.title} (${d.year})<br> <strong>Country:</strong> ${d.country}<br><strong>Spine:</strong> ${d.spine}</span><br><img src="${d.img}" ></a>`
    })

  svg.call(tip)

  // add circle
  svg
    .selectAll('circle')
    .data(filtered)
    .enter()
    .append('circle')
    .attr('class', 'dots')
    .attr('fill', function(d) {
      return colorScale(d.continent)
    })
    .attr('r', 3)
    .attr('cx', function(d) {
      return xPositionScale(d.year)
    })
    .attr('cy', function(d) {
      return yPositionScale(d.spine)
    })
    .attr('class', function(d) {
      return d.continent
    })
    .raise()
    .attr('opacity', 0.9)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  // add title
  svg
    .append('text')
    .text('All CC liscensed films by year and spine number')
    .attr('x', -30)
    .attr('y', -80)
    .attr('fill', 'black')
    .attr('font-size', 28)
    .attr('font-weight', 'bold')

  svg
    .append('text')
    .text(
      'Hover on the dots for more details on the film title, director, and even the movie poster!'
    )
    .attr('x', -30)
    .attr('y', -57)
    .attr('fill', 'grey')
    .attr('font-size', 14)

  // Add one dot in the legend for each name.
  svg
    .selectAll('mydots')
    .data(continent)
    .enter()
    .append('circle')
    .attr('cx', function(d, i) {
      return +i * 110 - d.length * 3
    })
    .attr('cy', -30)
    .attr('r', 7)
    .style('fill', function(d) {
      return colorScale(d)
    })

  // Add one dot in the legend for each name.
  svg
    .selectAll('mylabels')
    .data(continent)
    .enter()
    .append('text')
    .attr('x', function(d, i) {
      return 10 + i * 110 - d.length * 3
    })
    .attr('y', -30)
    .style('fill', function(d) {
      return colorScale(d)
    })
    .text(function(d) {
      return d
    })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')

  // axes
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.format('d'))
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
    .attr('stroke', 'none')
    .call(xAxis)
}
