// importing
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

// creating svg
const margin = { top: 50, left: 50, right: 50, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-01')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3
  .scaleLinear()
  .range([0, width])
  .domain([2009, 2020.5])

const yPositionScale = d3.scaleLinear().range([height, 0])

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Initial Approvals'])
  })

const line2 = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Initial Denials'])
  })
const tline = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Total Approvals'])
  })

const tline2 = d3
  .line()
  .x(function(d) {
    return xPositionScale(+d['Fiscal Year'])
  })
  .y(function(d) {
    return yPositionScale(+d['Total Denials'])
  })

// importing two files || more than one file
Promise.all([
  d3.csv(require('/data/initial.csv')),
  d3.csv(require('/data/total.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([initial, total]) {
  const approvals = total.map(d => +d['Total Approvals'])

  const max = d3.max(approvals)

  yPositionScale.domain([0, max + 100])

  // initial
  svg
    .append('path')
    .datum(initial)
    .attr('d', line)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('class', 'initial')

  svg
    .append('path')
    .datum(initial)
    .attr('d', line2)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('class', 'initial')

  svg
    .selectAll('.iapprovals')
    .data(initial)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d['Initial Approvals'])
    })
    .attr('cx', function(d) {
      return xPositionScale(d['Fiscal Year'])
    })
    .attr('fill', 'green')
    .attr('class', 'initial')

  svg
    .selectAll('.idenials')
    .data(initial)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d['Initial Denials'])
    })
    .attr('cx', function(d) {
      return xPositionScale(d['Fiscal Year'])
    })
    .attr('fill', 'red')
    .attr('class', 'initial')

  // total
  svg
    .append('path')
    .datum(total)
    .attr('d', tline)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('class', 'total')
    .style('visibility', 'hidden')

  svg
    .append('path')
    .datum(total)
    .attr('d', tline2)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('class', 'total')
    .style('visibility', 'hidden')

  svg
    .selectAll('.tapprovals')
    .data(total)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d['Total Approvals'])
    })
    .attr('cx', function(d) {
      return xPositionScale(d['Fiscal Year'])
    })
    .attr('fill', 'green')
    .style('visibility', 'hidden')
    .attr('class', 'total')

  svg
    .selectAll('.tdenials')
    .data(total)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d['Total Denials'])
    })
    .attr('cx', function(d) {
      return xPositionScale(d['Fiscal Year'])
    })
    .attr('fill', 'red')
    .style('visibility', 'hidden')
    .attr('class', 'total')

  // add anootation
  const annotations = [
    {
      note: {
        label: '13.5% drop in total H-1B approvals in 2015'
      },
      connector: {
        end: 'dot', // none, or arrow or dot
        type: 'line', // Line or curve
        points: 2, // Number of break in the curve
        lineType: 'horizontal'
      },
      y: yPositionScale(310162),
      x: xPositionScale(2015),
      color: 'orange',
      dx: -10,
      dy: 27
    }
  ]

  const makeAnnotations = d3Annotation.annotation().annotations(annotations)

  // rect
  svg
    .append('rect')
    .attr('x', xPositionScale(2017))
    .attr('y', 0)
    .attr('width', 120)
    .attr('height', height)
    .attr('fill', 'lightgrey')
    .style('visibility', 'hidden')
    .lower()

  // Add  axes
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.format('d'))
    .tickValues([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019])

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickValues([0, 100000, 200000, 300000, 400000])
    .tickSize(-width)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.domain').remove()

  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'grey')
    .call(yAxis)

  svg
    .selectAll('.x-axis line')
    .attr('stroke-dasharray', '2 2')
    .attr('stroke', 'none')
    .call(xAxis)

  // scrolly

  d3.select('#empty').on('stepin', function() {
    svg.selectAll('rect').style('visibility', 'hidden')
    svg.selectAll('.total').style('visibility', 'hidden')
    svg.selectAll('.initial').attr('opacity', 1)
    svg.selectAll('.at').style('visibility', 'hidden')

    // legend

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', -20)
      .attr('r', 4)
      .style('fill', 'green')
      .attr('class', 'legend')

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', -10)
      .attr('r', 4)
      .style('fill', 'red')
      .attr('class', 'legend')

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', -20)
      .text('Initial Approvals')
      .attr('font-weight', 600)
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend')

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', -10)
      .text('Initial Denails')
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend')
      .attr('font-weight', 600)

    svg.selectAll('.legend2').style('visibility', 'hidden')
    svg.selectAll('.at').style('visibility', 'hidden')
  })

  d3.select('#show').on('stepin', function() {
    svg.selectAll('path.total').style('visibility', 'visible')
    svg.selectAll('circle').style('visibility', 'visible')
    svg.selectAll('.initial').attr('opacity', 0.3)
    svg.selectAll('rect').style('visibility', 'hidden')
    svg.selectAll('.legend').style('visibility', 'hidden')
    svg.selectAll('.at').style('visibility', 'hidden')

    // legend

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', -20)
      .attr('r', 4)
      .style('fill', 'green')
      .attr('class', 'legend2')

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', -10)
      .attr('r', 4)
      .style('fill', 'green')
      .attr('opacity', 0.2)
      .attr('class', 'legend2')

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', 0)
      .attr('r', 4)
      .style('fill', 'red')
      .attr('class', 'legend2')

    svg
      .append('circle')
      .attr('cx', 460)
      .attr('cy', 10)
      .attr('r', 4)
      .attr('opacity', 0.2)
      .style('fill', 'red')
      .attr('class', 'legend2')

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', -20)
      .text('Total Approvals')
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend2')
      .attr('font-weight', 600)

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', -10)
      .text('Initial Approvals')
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend2')
      .attr('font-weight', 600)

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', 0)
      .text('Total Denails')
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend2')
      .attr('font-weight', 600)

    svg
      .append('text')
      .attr('x', 470)
      .attr('y', 10)
      .text('Initial Denails')
      .style('font-size', '9px')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'legend2')
      .attr('font-weight', 600)
  })

  d3.select('#show-rect').on('stepin', function() {
    svg.selectAll('path.total').style('visibility', 'visible')
    svg.selectAll('circle').style('visibility', 'visible')
    svg.selectAll('.initial').attr('opacity', 0.3)
    svg.selectAll('rect').style('visibility', 'visible')
    svg.selectAll('.legend2').style('visibility', 'visible')
    svg.selectAll('.legend').style('visibility', 'hidden')
    svg.selectAll('.at').style('visibility', 'hidden')
  })

  d3.select('#obama').on('stepin', function() {
    svg.selectAll('path.total').style('visibility', 'visible')
    svg.selectAll('circle').style('visibility', 'visible')
    svg.selectAll('.initial').attr('opacity', 0.3)
    svg.selectAll('rect').style('visibility', 'visible')

    svg.selectAll('.legend2').style('visibility', 'visible')
    svg.selectAll('.legend').style('visibility', 'hidden')
    svg.selectAll('.at').style('visibility', 'visible')

    svg
      .append('g')
      .call(makeAnnotations)
      .attr('class', 'at')
  })
}
