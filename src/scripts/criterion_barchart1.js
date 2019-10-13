import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 80, left: 80, right: 50, bottom: 50 }
const height = 500 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#barchart-01')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3
  .scaleBand()
  .range([height, 0])
  .padding(0.2)

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

  const nestedContinent = d3
    .nest()
    .key(d => d.continent)
    .rollup(function(v) {
      return v.length
    })
    .entries(filtered)
    .sort(function(a, b) {
      return a.value - b.value
    })

  const continents = nestedContinent.map(function(d) {
    return d.key
  })
  const values = nestedContinent.map(function(d) {
    return d.value
  })
  const maxValue = d3.max(values)

  xPositionScale.domain([0, maxValue + 10])
  yPositionScale.domain(continents)

  // rect
  svg
    .selectAll('rect')
    .data(nestedContinent)
    .enter()
    .append('rect')
    .attr('fill', 'skyblue')
    .attr('class', 'bar')
    .attr('y', function(d) {
      return yPositionScale(d.key)
    })
    .attr('height', yPositionScale.bandwidth())
    .transition()
    .duration(1000)
    .attr('width', function(d) {
      return xPositionScale(d.value)
    })

  // title
  svg
    .append('text')
    .text('Number of CC liscensed films by continent')
    .attr('text-anchor', 'middle')
    .attr('x', 200)
    .attr('y', -30)
    .attr('fill', 'black')
    .attr('font-size', 25)
    .attr('font-weight', 'bold')

  // subhead

  svg
    .append('text')
    .text(
      'Known for its taste in art cinema, not suprisingly, CC has liscensed a lot of European films '
    )
    .attr('x', -62)
    .attr('y', -8)
    .attr('fill', 'black')
    .attr('font-size', 15)

  svg
    .selectAll('.label')
    .data(nestedContinent)
    .enter()
    .append('text')
    .attr('fill', 'grey')
    .attr('class', 'label')
    .attr('font-weight', 500)
    .attr('x', function(d) {
      return xPositionScale(d.value) + 6
    })
    .attr('y', function(d) {
      return yPositionScale(d.key) + 18
    })
    .transition()
    .duration(1000)
    .attr('dy', '.75em')
    .text(function(d) {
      return d.value
    })
    .attr('font-size', 12)

  // Add  axes
  const xAxis = d3.axisBottom(xPositionScale)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  svg.selectAll('.domain').remove()

  svg
    .selectAll('.y-axis line')
    .attr('stroke', 'none')
    .call(yAxis)

  svg.selectAll('.x-axis line').attr('stroke', 'none')
}
