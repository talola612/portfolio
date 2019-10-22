import * as d3 from 'd3'
import { parse } from '@babel/parser'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }
const height = 600 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-7')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)

// Create a time parser
const parseTime = d3.timeParse('%H:%M')

// scales

const radius = 150

const angleScale = d3
  // .padding(0.5)
  .scaleBand()
  .range([0, Math.PI * 2])

const radiusScale = d3.scaleLinear().range([0, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.parsed_time))
  .innerRadius(0)
  .outerRadius(d => radiusScale(d.total))

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)
  .startAngle(d => angleScale(d))
  .endAngle(d => angleScale(d) + angleScale.bandwidth())

const bands = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00'
]

// import data
d3.csv(require('../../data/time-binned.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  datapoints.forEach(function(d) {
    d.parsed_time = parseTime(d.time)
  })

  const values = datapoints.map(d => d.total)
  const minValue = d3.min(values)
  const maxValue = d3.max(values)

  angleScale.domain([parseTime('01:00'), parseTime('00:00')])
  radiusScale.domain([minValue, maxValue])
}
