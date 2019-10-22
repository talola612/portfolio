import * as d3 from 'd3'

const margin = { top: 20, left: 20, right: 20, bottom: 20 }
const height = 450 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#chart-8')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)

// scales
const angleScale = d3
  // .padding(0.5)
  .scaleBand()
  .range([0, Math.PI * 2])

const radius = 180

const radiusScale = d3
  .scaleLinear()
  .domain([0, 1]) // later will change
  .range([0, radius])

const labelArc = d3
  .arc()
  .innerRadius(radius)
  .outerRadius(radius + 30)
  .startAngle(d => angleScale(d))
  .endAngle(d => angleScale(d))

const line = d3
  .radialLine()
  .angle(d => angleScale(d.name))
  .radius(d => radiusScale(d.value))

const maxMinutes = 60
const maxPoints = 30
const maxFG = 10
const max3P = 5
const maxFT = 10
const maxRB = 15
const maxAST = 10
const maxSTL = 5
const maxBK = 5

// import data
d3.csv(require('../../data/nba.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const player = datapoints[0]

  const customDatapoints = [
    { name: 'Minutes', value: player.MP / maxMinutes },
    { name: 'Points', value: player.PTS / maxPoints },
    { name: 'Field Goals', value: player.FG / maxFG },
    { name: '3-Point Field Goals', value: player['3P'] / max3P },
    { name: 'Free Throws', value: player.FT / maxFT },
    { name: 'Rebounds', value: player.TRB / maxRB },
    { name: 'Assists', value: player.AST / maxAST },
    { name: 'Steals', value: player.STL / maxSTL },
    { name: 'Blocks', value: player.BLK / maxBK }
  ]

  const categories = customDatapoints.map(d => d.name)

  customDatapoints.push(customDatapoints[0])

  angleScale.domain(categories)

  const bands = [0.2, 0.4, 0.6, 0.8, 1]

  svg
    .selectAll('.outside-label')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(function(d) {
      return d
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

    .attr('transform', function(d) {
      return `translate(${labelArc.centroid(
        d
      )})rotate(${(angleScale(d) / Math.PI) * 180})`
    })
    .attr('font-weight', 700)

  svg
    .selectAll('.mask')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', function(d, i) {
      if (i % 2 === 0) {
        return '#c94435'
      } else {
        return '#FFB81C'
      }
    })
    .attr('mask', 'url(#masked)')
    .lower()

  const g = svg.append('g')
  const mask = g.append('mask').attr('id', 'masked')

  mask
    .append('path')
    .datum(customDatapoints)
    .attr('d', line)
    .attr('fill', 'white')

  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', function(d) {
      if (d === 1 || d === 0.6 || d === 0.2) {
        return '#e8e7e5'
      } else {
        return '#f6f6f6'
      }
    })
    .lower()

  svg
    .append('circle')
    .attr('r', 3)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', 'black')

  function fillLabel(max, category) {
    svg
      .selectAll('.label')
      .data(bands)
      .enter()
      .append('text')
      .text(d => d * max)
      .attr('y', d => -radiusScale(d))
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('transform', `rotate(${(angleScale(category) / Math.PI) * 180})`)
  }

  fillLabel(maxMinutes, 'Minutes')
  fillLabel(maxPoints, 'Points')
  fillLabel(maxFG, 'Field Goals')
  fillLabel(max3P, '3-Point Field Goals')
  fillLabel(maxFT, 'Free Throws')
  fillLabel(maxRB, 'Rebounds')
  fillLabel(maxAST, 'Assists')
  fillLabel(maxSTL, 'Steals')
  fillLabel(maxBK, 'Blocks')
}
