import * as d3 from 'd3'

const margin = { top: 10, left: 10, right: 10, bottom: 10 }

const height = 480 - margin.top - margin.bottom

const width = 480 - margin.left - margin.right

const svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const radius = 200

const radiusScale = d3
  .scaleLinear()
  .domain([10, 100])
  .range([40, radius])

const angleScale = d3
  .scalePoint()
  .domain([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
    'Blah'
  ])
  .range([0, Math.PI * 2])

const line = d3
  .radialArea()
  .outerRadius(function(d) {
    return radiusScale(d.high_temp)
  })
  .innerRadius(function(d) {
    return radiusScale(d.low_temp)
  })
  .angle(function(d) {
    return angleScale(d.month_name)
  })

// data

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  const container = svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

  datapoints.forEach(d => {
    d.high_temp = +d.high_temp
    d.low_temp = +d.low_temp
  })

  // Filter it so I'm only looking at NYC datapoints

  function genData(cityName) {
    const data = datapoints.filter(d => d.city === cityName)
    data.push(data[0])
    return data
  }
  const nycDatapoints = genData('NYC')
  const bjDatapoints = genData('Beijing')
  const sthDatapoints = genData('Stockholm')
  const limaDatapoints = genData('Lima')
  const tusDatapoints = genData('Tuscon')

  // const nycDatapoints = datapoints.filter(d => d.city === 'NYC')
  // nycDatapoints.push(nycDatapoints[0])

  // circular path
  container
    .append('path')
    .attr('class', 'temp')
    .datum(nycDatapoints)
    .attr('d', line)
    .attr('fill', 'black')
    .attr('opacity', 0.75)

  // test in the middle
  container
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'city-name')
    .text('NYC')
    .attr('font-size', 30)
    .attr('font-weight', 700)
    .attr('alignment-baseline', 'middle')

  // bands
  const circleBands = [20, 30, 40, 50, 60, 70, 80, 90]
  const textBands = [30, 50, 70, 90]

  container
    .selectAll('.bands')
    .data(circleBands)
    .enter()
    .append('circle')
    .attr('class', 'bands')
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', function(d) {
      return radiusScale(d)
    })
    .lower()

  // text on the band
  container
    .selectAll('.temp-notes')
    .data(textBands)
    .enter()
    .append('text')
    .attr('class', 'temp-notes')
    .attr('x', 0)
    .attr('y', d => -radiusScale(d))
    .attr('dy', -2)
    .text(d => d + '°')
    .attr('text-anchor', 'middle')
    .attr('font-size', 8)

  // scrolly

  d3.select('#nyc').on('stepin', function() {
    container
      .select('path')
      .datum(nycDatapoints)
      .attr('d', line)
      .attr('fill', 'yellowgreen')
    container.select('.city-name').text('NYC')
  })

  d3.select('#beijing').on('stepin', function() {
    container
      .select('path')
      .datum(bjDatapoints)
      .attr('d', line)
      .attr('fill', 'gold')
    container.select('.city-name').text('Beijing')
  })

  d3.select('#stockholm').on('stepin', function() {
    container
      .select('path')
      .datum(sthDatapoints)
      .attr('d', line)
      .attr('fill', 'pink')
    container.select('.city-name').text('Stockholm')
  })

  d3.select('#lima').on('stepin', function() {
    container
      .select('path')
      .datum(limaDatapoints)
      .attr('d', line)
      .attr('fill', 'skyblue')
    container.select('.city-name').text('Lima')
  })
  d3.select('#tuscon').on('stepin', function() {
    container
      .select('path')
      .datum(tusDatapoints)
      .attr('d', line)
      .attr('fill', 'purple')
    container.select('.city-name').text('Tuscon')
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
    const newHeight = svgHeight - margin.top - margin.bottom

    // update scales
    const radius = newHeight / 2.5

    radiusScale.range([40, radius])

    line
      .outerRadius(function(d) {
        return radiusScale(d.high_temp)
      })
      .innerRadius(function(d) {
        return radiusScale(d.low_temp)
      })

    // update bands

    container.selectAll('.bands').attr('r', function(d) {
      return radiusScale(d)
    })
    container.selectAll('.temp-notes').attr('y', d => -radiusScale(d))

    // updating graphics
  }

  // always goes with
  window.addEventListener('resize', render)
  render()
}
