import * as d3 from 'd3'

const margin = { top: 30, left: 0, right: 0, bottom: 0 }

const height = 330 - margin.top - margin.bottom
const width = 275 - margin.left - margin.right

const container = d3.select('#chart-9')

// scales
const angleScale = d3
  // .padding(0.5)
  .scaleBand()
  .range([0, Math.PI * 2])

const radius = 100

const radiusScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, radius])

const labelArc = d3
  .arc()
  .innerRadius(radius)
  .outerRadius(radius + 25)
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
  console.log(datapoints)

  container
    .selectAll('svg')
    .data(datapoints)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
    .each(function(d) {
      const svg = d3.select(this)
      const name = d.Name
      const datapoints = d
      const customDatapoints = [
        { name: 'Minutes', value: datapoints.MP / maxMinutes },
        { name: 'Points', value: datapoints.PTS / maxPoints },
        { name: 'Field Goals', value: datapoints.FG / maxFG },
        { name: '3-Point Field Goals', value: datapoints['3P'] / max3P },
        { name: 'Free Throws', value: datapoints.FT / maxFT },
        { name: 'Rebounds', value: datapoints.TRB / maxRB },
        { name: 'Assists', value: datapoints.AST / maxAST },
        { name: 'Steals', value: datapoints.STL / maxSTL },
        { name: 'Blocks', value: datapoints.BLK / maxBK }
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
        .attr('font-weight', 500)
        .style('font-size', 10)

      svg
        .selectAll('circle')
        .data(bands)
        .enter()
        .append('circle')
        .attr('r', d => radiusScale(d))
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('mask', `url(#mask-${name.replace(' ', '')})`)
        .attr('class', `${datapoints.Team}`)
        .lower()

      const g = svg.append('g')

      const mask = g.append('mask').attr('id', `mask-${name.replace(' ', '')}`)

      console.log(datapoints.Team)
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
        .append('text')
        .text('0')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 8)

      svg
        .append('text')
        .text(name)
        .attr('x', 0)
        .attr('y', -142)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .style('font-size', 15)
        .attr('font-weight', 500)

      svg
        .append('text')
        .text(function(d) {
          if (datapoints.Team === 'CLE') {
            return 'Cleveland Cavaliers'
          } else if (datapoints.Team === 'GSW') {
            return 'Golden State Warriors'
          } else if (datapoints.Team === 'HOU') {
            return 'Houston Rockets'
          } else if (datapoints.Team === 'SAS') {
            return 'San Antonio Spurs'
          } else if (datapoints.Team === 'NOP') {
            return 'New Orleans Pelicans'
          } else if (datapoints.Team === 'MIL') {
            return 'Milwaukee Bucks'
          } else if (datapoints.Team === 'OKC') {
            return 'Oklahoma City Thunder'
          } else if (datapoints.Team === 'PHI') {
            return 'Philadelphia 76ers'
          } else if (datapoints.Team === 'MIN') {
            return 'Minnesota Timberwolves'
          }
        })
        .attr('x', 0)
        .attr('y', -130)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .style('font-size', 10)

      console.log(datapoints)

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
          .attr(
            'transform',
            `rotate(${(angleScale(category) / Math.PI) * 180})`
          )
          .style('font-size', 8)
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
    })
}
