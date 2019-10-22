import * as d3 from 'd3'
import { maxHeaderSize } from 'http'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)

const angleScale = d3
  // .padding(0.5)
  .scaleBand()
  .range([0, Math.PI * 2])

const radius = 180

const radiusScale = d3
  .scaleLinear()
  .domain([-20, 90])
  .range([0, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.month_name))
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))

// import data
d3.csv(require('../../data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  const months = datapoints.map(d => d.month_name)
  angleScale.domain(months)

  datapoints.push(datapoints[0])

  const bands = [20, 30, 40, 50, 60, 70, 80, 90]
  const degree = [30, 50, 70, 90]

  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('stroke', 'grey')
    .attr('fill', 'none')

  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'lightblue')
    .lower()

  svg
    .append('text')
    .text('NYC')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style('font-size', 35)
    .attr('font-weight', 700)

  svg
    .selectAll('.label')
    .data(degree)
    .enter()
    .append('text')
    .text(d => d + '°')
    .attr('y', d => -radiusScale(d) - 5)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
}
