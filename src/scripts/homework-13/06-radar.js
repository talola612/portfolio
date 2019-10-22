import * as d3 from 'd3'

const margin = { top: 20, left: 20, right: 20, bottom: 0 }
const height = 400 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#chart-6')
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

const radius = 160

const radiusScale = d3
  .scaleLinear()
  .domain([0, 5])
  .range([0, radius])

const line = d3
  .radialLine()
  .angle(d => angleScale(d.category))
  .radius(d => radiusScale(d.score))

// import data
d3.csv(require('../../data/ratings.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const name = datapoints.map(d => d.category)

  angleScale.domain(name)

  datapoints.push(datapoints[0])

  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'pink')
    .attr('stroke', 'black')
    .attr('opacity', 0.5)

  const bands = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('stroke', 'lightgrey')
    .attr('fill', 'none')
    .lower()

  svg
    .selectAll('.radius-line')
    .data(angleScale.domain())
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', -radius)
    .attr('stroke', 'lightgrey')
    .attr('transform', function(d) {
      return `rotate(${(angleScale(d) * 180) / Math.PI})`
    })
    .lower()

  svg
    .append('circle')
    .attr('r', 4)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', 'grey')
    .lower()

  svg
    .selectAll('.outside-variable')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('y', -radius)
    .attr('dy', -10)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 600)
    .attr('transform', function(d) {
      return `rotate(${(angleScale(d) * 180) / Math.PI})`
    })
}
