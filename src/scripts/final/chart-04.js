import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 500 - margin.top - margin.bottom
const width = 900 - margin.left - margin.right

const svg = d3
  .select('#chart-04')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// projection & graticule
const projection = d3.geoMercator()
const path = d3.geoPath().projection(projection)

// scale
const colorScale = d3
  .scaleSequential(d3.interpolateGnBu)
  .domain([0, 80000])
  .clamp(true)

Promise.all([
  d3.json(require('/data/world.topojson')),
  d3.csv(require('/data/green_card_with_coord.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  const countries = topojson.feature(json, json.objects.countries)

  for (let i = 0; i < datapoints.length; i++) {
    const dataCountry = datapoints[i].country
    const dataValue = +datapoints[i].count

    for (let n = 0; n < countries.features.length; n++) {
      const jsonCountry = countries.features[n].properties.name

      if (jsonCountry.includes(dataCountry)) {
        countries.features[n].properties.value = dataValue
        break
      }
    }
  }
  console.log(countries)

  // svg
  //   .selectAll('.country')
  //   .data(countries.features)
  //   .enter()
  //   .append('path')
  //   .attr('class', 'country')
  //   .attr('d', path)
  //   .attr('fill', 'lightgrey')

  const mouseOver = function(d) {
    d3.selectAll('.countries')
      .transition()
      .duration(200)
    // .style('opacity', 0.5)
    d3.select(this)
      .transition()
      .duration(200)
      .style('opacity', 2.5)
      .style('stroke', 'grey')
  }

  const mouseLeave = function(d) {
    d3.selectAll('.countries')
      .transition()
      .duration(200)
      .style('opacity', 0.8)
    d3.select(this)
      .transition()
      .duration(200)
      .style('stroke', 'transparent')
  }

  svg
    .selectAll('.countries')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', function(d) {
      return colorScale(d.properties.value)
      // return colorScale(d.value)
    })
    .on('mouseover', mouseOver)
    .on('mouseleave', mouseLeave)

  svg
    .selectAll('.names')
    .data(datapoints)
    .enter()
    .append('text')
    .text(d => d.country)
    .attr('transform', d => {
      const coords = projection([d.Longitude, d.Latitude])
      return `translate(${coords})`
    })
    .attr('class', 'names')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 13)
    // .style(
    //   'text-shadow',
    //   '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff'
    // )
    .on('mouseover', function() {
      d3.select(this).attr('visibility', 'visible')
    })
    .on('mouseleave', mouseLeave)
}
