// importing
import * as d3 from 'd3'

// creating svg
const margin = { top: 30, left: 50, right: 50, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#x')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg
  .append('text')
  .text('sdsfdsadadsf')
  .attr('text-anchor', 'middle')
  .attr('x', width / 2)
  .attr('y', -5)
  .attr('class', 'haha')
  .attr('font-size', 16)
  .style('visibility', 'hidden')

function ready() {
  d3.select('#ad').on('stepin', function() {
    svg.select('.haha').style('visibility', 'visible')
  })
}
ready()
