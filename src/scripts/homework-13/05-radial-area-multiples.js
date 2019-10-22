import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }

const height = 450 - margin.top - margin.bottom

const width = 780 - margin.left - margin.right

const container = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const angleScale = d3
  // .padding(0.5)
  .scaleBand()
  .range([0, Math.PI * 2])

const radius = 59

const radiusScale = d3
  .scaleLinear()
  .domain([-80, 100])
  .range([0, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.month_name))
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))

const xPositionScale = d3
  .scalePoint()
  .range([0 + margin.left, width - margin.right])
  .padding(0)

// import data

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  const nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  const cities = ['NYC', 'Tuscon', 'Lima', 'Beijing', 'Stockholm', 'Melbourne']

  xPositionScale.domain(cities)

  const months = datapoints.map(d => d.month_name)
  angleScale.domain(months)

  container
    .selectAll('g')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(${xPositionScale(d.key)}, ${height / 2})`
    })
    .each(function(d) {
      const svg = d3.select(this)
      const name = d.key
      const datapoints = d.values

      datapoints.push(datapoints[0])

      const bands = [20, 40, 60, 80, 100]
      const degree = [20, 60, 100]

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
        .text(name)
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 12)
        .attr('font-weight', 700)

      svg
        .selectAll('.label')
        .data(degree)
        .enter()
        .append('text')
        .text(d => d + '°')
        .attr('y', d => -radiusScale(d) - 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 5)
    })
}
