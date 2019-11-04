import * as d3 from 'd3'

const margin = { top: 100, left: 50, right: 150, bottom: 30 }

const height = 700 - margin.top - margin.bottom

const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const parseTime = d3.timeParse('%B-%y')

const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

d3.csv(require('/data/housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })
  const dates = datapoints.map(d => d.datetime)
  const prices = datapoints.map(d => +d.price)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain(d3.extent(prices))

  const nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  svg
    .selectAll('path')
    .data(nested)
    .enter()
    .append('path')
    .attr('d', function(d) {
      return line(d.values)
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('class', d => {
      return `region ${d.key.toLowerCase().replace(/[^a-z]*/g, '')}`
    })

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('cx', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .attr('class', d => {
      return `region ${d.key.toLowerCase().replace(/[^a-z]*/g, '')}`
    })
    .style('visibility', 'hidden')

  svg
    .selectAll('text')
    .data(nested)
    .enter()
    .append('text')
    .attr('y', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('x', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .text(function(d) {
      return d.key
    })
    .attr('dx', 6)
    .attr('dy', 4)
    .attr('font-size', '12')
    .attr('class', d => {
      return `region ${d.key.toLowerCase().replace(/[^a-z]*/g, '')}`
    })
    .style('visibility', 'hidden')

  svg
    .append('text')
    .attr('font-size', '24')
    .attr('text-anchor', 'middle')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('dx', 40)

  const rectWidth =
    xPositionScale(parseTime('February-17')) -
    xPositionScale(parseTime('November-16'))

  svg
    .append('rect')
    .attr('x', xPositionScale(parseTime('December-16')))
    .attr('y', 0)
    .attr('width', rectWidth)
    .attr('height', height)
    .attr('fill', '#C2DFFF')
    .style('visibility', 'hidden')
    .lower()

  // axes
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %y'))
    .ticks(9)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr(
      'transform',
      'translate(0,' + (height - margin.top - margin.bottom) + ')'
    )
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  // steps

  // make empty
  d3.select('#empty').on('stepin', function() {
    svg.selectAll('circle.region').attr('fill', 'none')
    svg.selectAll('path.region').attr('stroke', 'none')
    svg.selectAll('text.region').attr('fill', 'none')
    svg.select('rect').style('visibility', 'hidden')
  })

  // show all lines and circles
  d3.select('#show').on('stepin', function() {
    svg
      .selectAll('path.region')
      .attr('stroke', function(d) {
        return colorScale(d.key)
      })
      .style('visibility', 'visible')
    svg
      .selectAll('circle.region')
      .attr('fill', function(d) {
        return colorScale(d.key)
      })
      .style('visibility', 'visible')

    svg
      .selectAll('text.region')
      .attr('fill', 'black')
      .style('visibility', 'visible')

    svg.select('rect').style('visibility', 'hidden')
  })

  // show only us as red
  d3.select('#us').on('stepin', function() {
    svg
      .selectAll('circle.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')

    svg
      .selectAll('circle.region.us')
      .attr('fill', 'red')
      .raise()

    svg
      .selectAll('path.region')
      .attr('stroke', 'lightgrey')
      .style('visibility', 'visible')

    svg
      .selectAll('path.region.us')
      .attr('stroke', 'red')
      .raise()

    svg
      .selectAll('text.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')

    svg
      .selectAll('text.region.us')
      .attr('font-weight', 600)
      .attr('fill', 'red')
      .raise()

    svg.select('rect').style('visibility', 'hidden')
  })

  // color more regions
  d3.select('#regions').on('stepin', function() {
    svg
      .selectAll('circle.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('circle.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('fill', 'lightblue')
      .style('visibility', 'visible')

    svg
      .selectAll('path.region')
      .attr('stroke', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('path.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('stroke', 'lightblue')
      .style('visibility', 'visible')
    svg
      .selectAll('text.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('text.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('fill', 'lightblue')
      .style('visibility', 'visible')

    svg.select('rect').style('visibility', 'hidden')
  })

  // draw winter rect
  d3.select('#winter').on('stepin', function() {
    svg
      .selectAll('circle.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('circle.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('fill', 'lightblue')
      .style('visibility', 'visible')

    svg
      .selectAll('path.region')
      .attr('stroke', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('path.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('stroke', 'lightblue')
      .style('visibility', 'visible')
    svg
      .selectAll('text.region')
      .attr('fill', 'lightgrey')
      .style('visibility', 'visible')
    svg
      .selectAll('text.region')
      .filter('.mountain,.pacific,.westsouthcentral,.southatlantic')
      .attr('fill', 'lightblue')
      .style('visibility', 'visible')
    svg.select('rect').style('visibility', 'visible')
  })

  /* responsive  */

  function render() {
    // getting the div the svg is in + getting the height and width of div
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    const svgHeight = window.innerHeight

    // getting the svg and set the size of the svg responsively
    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    // setting the size of the drawing region (the g)
    const newWidth = svgWidth - margin.left - margin.right
    const newHeight = svgHeight - margin.top - margin.bottom

    // update position scales
    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    // update axes
    if (svgWidth < 400) {
      xAxis.ticks(2)
    } else if (svgWidth < 550) {
      xAxis.ticks(4)
    } else {
      xAxis.ticks(null)
    }

    svg
      .select('.x-axis')
      .attr('transform', 'translate(0,' + newHeight + ')')
      .call(xAxis)

    svg.select('.y-axis').call(yAxis)

    // updating graphics
    svg
      .selectAll('circle.region')
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg.selectAll('path.region').attr('d', function(d) {
      return line(d.values)
    })

    svg
      .selectAll('text.region')
      .attr('y', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('x', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg
      .selectAll('rect')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('height', newHeight)
  }

  // always goes with
  window.addEventListener('resize', render)
  render()
}
