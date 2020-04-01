import { defaultOptions, Options } from './options'
import { deepMerge } from './utils'

declare const d3: any

/**
 * RankingBar D3 Renderer
 *
 * @author ryancui-
 */
class RankingBar {
  colorMapping: object
  currentdate: string
  rate: number[]
  currentData: any[]
  indexList: number[]
  time: string[]
  tail: string
  date: string[]
  names: string[]
  data: any
  options: Options
  baseTime: number
  lastData: any[]
  lastname: string

  svg: any
  timeFormat: string
  reverse: boolean
  showMessage: boolean
  interval_time: number
  allow_up: boolean
  always_up: boolean
  big_value: boolean
  update_rate: number
  showLabel: boolean
  format: string
  grid: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }
  isPlaying: boolean
  dom: HTMLElement
  innerWidth: number
  innerHeight: number
  xValue: Function
  yValue: Function
  g: any
  xAxisG: any
  yAxisG: any
  xScale: any
  yScale: any
  xAxis: any
  yAxis: any
  tooltipDom: HTMLElement
  tooltip: any
  counter: object
  avg: number
  nextIndex: number
  playTimer: number
  dateLabel: any
  isDateRanking: boolean

  constructor(dom: HTMLElement) {
    this.colorMapping = {}
    this.currentdate = undefined
    this.rate = []
    this.currentData = []
    this.indexList = []
    this.time = undefined
    this.tail = undefined
    this.date = []
    this.names = []
    this.data = null
    this.options = null
    this.baseTime = 1000
    this.lastData = []
    this.lastname = ''

    // Old config
    this.timeFormat = '%Y-%m-%d'
    this.reverse = false
    this.showMessage = false
    this.interval_time = 1.5

    this.allow_up = false
    this.always_up = false

    this.big_value = false
    this.update_rate = 0.5

    this.showLabel = true

    this.format = ',.0f'

    this.grid = {
      left: 300,
      right: 80,
      top: 0,
      bottom: 30
    }

    this.isPlaying = false
    this.dom = dom
    this.svg = d3.select(dom)

    // Hacking... use this.$refs.dom will cause an error in Vue.js
    if (!this.svg._parents[0]) {
      this.svg._parents[0] = document.getElementsByTagName('html')[0]
    }
  }

  /**
   * @param data {Array<Object>}
   * @param options {Object}
   * @param forceUpdate {Boolean}
   */
  render(data: any, options: Object, forceUpdate: boolean) {
    // TODO: Currently just remove everything and render again
    if (this.svg) {
      this.svg.selectAll('*').remove()
    }

    // Merge default options
    this.options = deepMerge(defaultOptions, options) as Options
    console.log(this.options)

    if (forceUpdate) {
      this.colorMapping = {}
    }

    this.data = data.slice(0)
    this.date = []
    this.names = []
    this.lastData = []

    this.data.forEach((element: any) => {
      if (this.date.indexOf(element['date']) == -1) {
        this.date.push(element['date'])
      }
    })

    this.time = this.date
    // Whether to enable cornerLabel date animation
    this.isDateRanking = this.time.every(_ => /\d{4}-\d{2}-\d{2}/.test(_))

    this.data
      .sort((a, b) => Number(b.value) - Number(a.value))
      .forEach((e: any) => {
        if (this.names.indexOf(e.name) == -1) {
          this.names.push(e.name)
        }
      })

    // width/height must exist is svg element
    const width = this.svg.attr('width')
    const height = this.svg.attr('height')

    // grid.left is calculated by max(nameList[].length)
    const nameWidths: string[] = []
    this.svg.append('g')
      .selectAll('.dummyText')
      .data(this.names)
      .enter()
      .append('text')
      .attr('font-size', this.options.barLabel.fontSize + 'px')
      .text(d => d)
      .each(function () {
        nameWidths.push(this.getComputedTextLength())
        this.remove()
      })

    console.log(nameWidths)

    const paddingLeft = d3.max(nameWidths) + this.options.grid.left + 15
    this.innerWidth = width - paddingLeft - this.options.grid.right - 15
    this.innerHeight = height - this.options.grid.top - this.options.grid.bottom - 30
    this.xValue = d => Number(d.value)
    this.yValue = d => d.name

    this.g = this.svg
      .append('g')
      .attr('class', 'outer')
      .attr('transform', `translate(${paddingLeft}, ${this.options.grid.top})`)

    this.xAxisG = this.g
      .append('g')
      .attr('transform', `translate(0, ${this.innerHeight})`)

    this.xScale = d3.scaleLinear()
    this.yScale = d3.scaleBand().paddingInner(0.3).paddingOuter(0)

    this.xAxis = d3
      .axisBottom()
      // .ticks(this.options.xAxis.tickCount)
      .tickPadding(20)
      .tickFormat(v => this.options.xAxis.tickFormat(d3, v))
      .tickSize(-this.innerHeight)
      .scale(this.xScale)

    // Append HTML Tooltip to <svg> element
    if (this.options.tooltip.show && !this.tooltip && this.dom.parentElement) {
      this.tooltipDom = document.createElement('div')
      this.dom.parentElement.append(this.tooltipDom)

      this.tooltip = d3.select(this.tooltipDom)
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.6)')
        .style('color', '#fff')
        .style('font-size', '13px')
        .style('box-sizing', 'border-box')
        .style('padding', '10px')
        .style('border', '0')
        .style('border-radius', '4px')
    }

    this.counter = { value: 1 }
    this.avg = 0

    switch (this.options.init) {
      case 'start':
        this.currentdate = this.time[0]
        this.getCurrentData(this.time[0])
        break
      case 'end':
        this.currentdate = this.time[this.time.length - 1]
        this.getCurrentData(this.time[this.time.length - 1])
    }
  }

  /**
   * Start animation
   */
  play() {
    const execute = () => {
      if (this.nextIndex >= this.time.length) {
        this.isPlaying = false
        this.nextIndex = 0
        return
      }

      this.isPlaying = true
      this.currentdate = this.time[this.nextIndex]
      this.getCurrentData(this.time[this.nextIndex])
      this.nextIndex++
      this.playTimer = setTimeout(execute, this.baseTime * this.interval_time + 500)
    }

    clearTimeout(this.playTimer)
    this.g.selectAll('.bar').remove()
    this.xAxisG.selectAll('.tick').remove()
    this.g.select('.dateLabel').remove()
    this.nextIndex = 0
    execute()
  }

  getCurrentData(date) {
    this.rate = []
    this.currentData = []
    this.indexList = []

    this.data.forEach(element => {
      if (element['date'] === date && parseFloat(element['value']) != 0) {
        this.currentData.push(element)
      }
    })

    // this.rate['MAX_RATE'] = 0
    // this.rate['MIN_RATE'] = 1
    // this.currentData.forEach(e => {
    //   this.lastData.forEach(el => {
    //     if (el.name == e.name) {
    //       this.rate[e.name] = Number(Number(e.value) - Number(el.value))
    //     }
    //   })
    //   if (!this.rate[e.name]) {
    //     this.rate[e.name] = this.rate['MIN_RATE']
    //   }
    //   if (this.rate[e.name] > this.rate['MAX_RATE']) {
    //     this.rate['MAX_RATE'] = this.rate[e.name]
    //   } else if (this.rate[e.name] < this.rate['MIN_RATE']) {
    //     this.rate['MIN_RATE'] = this.rate[e.name]
    //   }
    // })
    this.currentData = this.currentData.slice(0, this.options.rankingCount)
    this._dataSort()

    d3.transition('2')
      .each(this._redraw.bind(this))
      .each(this._change.bind(this))
    this.lastData = this.currentData
  }

  _getColor(d) {
    // TODO: Give default calor if no options.color provided
    return this.colorMapping[d.type] || (
      this.colorMapping[d.type] = this.options.color
        [Object.keys(this.colorMapping).length % this.options.color.length]
    )
  }

  _dataSort() {
    this.currentData.sort((a, b) => {
      if (Number(a.value) === Number(b.value)) {
        let r1 = 0
        let r2 = 0
        for (let index = 0; index < a.name.length; index++) {
          r1 = r1 + a.name.charCodeAt(index)
        }
        for (let index = 0; index < b.name.length; index++) {
          r2 = r2 + b.name.charCodeAt(index)
        }
        return r2 - r1
      } else {
        return this.reverse
          ? (Number(a.value) - Number(b.value))
          : (Number(b.value) - Number(a.value))
      }
    })
  }

  _redraw() {
    if (this.currentData.length === 0) return

    // Control xAxis domain/range
    if (this.big_value) {
      this.xScale
        .domain([
          2 * d3.min(this.currentData, this.xValue) - d3.max(this.currentData, this.xValue),
          d3.max(this.currentData, this.xValue) + 10
        ])
        .range([0, this.innerWidth])
    } else {
      this.xScale
        .domain([0, d3.max(this.currentData, this.xValue)])
        .range([0, this.innerWidth])
        .nice()
    }

    // Control yAxis domain/range
    this.yScale
      .domain(this.currentData.map(d => d.name).reverse())
      .range([this.innerHeight, 0])

    // TODO: .enter() is preferable
    const dateLabel = this.g.select('.dateLabel')
    if (dateLabel.empty()) {
      this.dateLabel = this.g.insert('text')
        .data(this.currentdate)
        .attr('class', 'dateLabel')
        .attr('style:visibility', 'visible')
        .attr('x', this.innerWidth - 5)
        .attr('y', this.innerHeight - 5)
        .style('fill', this.options.eventLabel.fontColor)
        .style('font-size', `${this.options.eventLabel.fontSize}px`)
        .style('font-weight', this.options.eventLabel.fontWeight)
        .attr('text-anchor', 'end')
        .text(this.currentdate)

      this.dateLabel.style('opacity', 0)
        .transition()
        .duration(this.baseTime * this.interval_time)
        .ease(d3.easeLinear)
        .style('opacity', 1)
    } else if (this.isDateRanking) {
      this.dateLabel
        .data(this.currentData)
        .transition()
        .duration(this.baseTime * this.interval_time)
        .ease(d3.easeLinear)
        .tween('text', function (d) {
          var self = this
          var i = d3.interpolateDate(
            new Date(self.textContent),
            new Date(d.date)
          )
          const formatFunc = d3.timeFormat('%Y-%m-%d')
          return function (t) {
            self.textContent = formatFunc(i(t))
          }
        })
    } else {
      this.dateLabel.text(this.currentdate)
    }


    // xAxis ticks animations
    this.xAxisG
      .transition()
      .duration(this.baseTime * this.interval_time)
      .ease(d3.easeLinear)
      .call(this.xAxis)
    this.xAxisG.selectAll('.tick > text')
      .style('font-size', `${this.options.xAxis.fontSize}px`)
      .style('font-weight', this.options.xAxis.fontWeight)
      .style('fill', this.options.xAxis.fontColor)

    this.xAxisG.selectAll('.tick > line').style('stroke', this.options.xAxis.tickColor)
    this.xAxisG.select('.domain').remove()

    const bar = this.g.selectAll('.bar').data(this.currentData, d => d.name)

    // 1. Animation from (0 ~ Exists)
    const barEnter = bar
      .enter()
      .insert('g')
      .attr('class', 'bar')
      .attr('transform', d => 'translate(0, ' + (this.yScale(this.yValue(d)) + 10) + ')')

    let barHeight
    if (this.options.bar.height === 'auto') {
      barHeight = d3.min([this.innerHeight / (this.currentData.length + 2), 12])
    } else {
      barHeight = Number(this.options.bar.height)
    }

    barEnter
      .append('rect')
      .attr('width', 0)
      .attr('fill-opacity', 0)
      .attr('height', barHeight)
      .attr('y', 50)
      .on('mouseover', datum => {
        this.tooltip.html(this.options.tooltip.formatter(d3, datum))
          .style('visibility', 'visible')
          .style('left', `${d3.event.offsetX + 10}px`)
          .style('top', `${d3.event.offsetY + 10}px`)
      })
      .on('mousemove', d => {
        this.tooltip
          .style('left', `${d3.event.offsetX + 10}px`)
          .style('top', `${d3.event.offsetY + 10}px`)
      })
      .on('mouseout', d => {
        this.tooltip.style('visibility', 'hidden')
      })
      .style('fill', d => this._getColor(d))
      .transition('a')
      .delay(500 * this.interval_time / 3)
      .duration(2490 * this.interval_time / 3)
      .attr('y', 0)
      .attr('width', d => this.xScale(this.xValue(d)))
      .attr('fill-opacity', 1)

    d3.selectAll('rect').attr('rx', this.options.bar.round)

    if (this.options.barLabel.show) {
      barEnter
        .append('text')
        .attr('y', 50)
        .attr('fill-opacity', 0)
        .style('font-size', `${this.options.barLabel.fontSize}px`)
        .style('font-weight', `${this.options.barLabel.fontWeight}`)
        .style('fill', d =>
          this.options.barLabel.fontColor === '='
            ? this._getColor(d)
            : this.options.barLabel.fontColor
        )
        .transition('2')
        .delay(500 * this.interval_time / 3)
        .duration(2490 * this.interval_time / 3)
        .attr('fill-opacity', 1)
        .attr('y', 0)
        .attr('class', 'label')
        .attr('x', -10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .text(datum => datum.name)
    }

    // BarInfo
    let barInfo
    if (this.options.barInfo.show) {
      barEnter
        .append('text')
        .attr('x', 0)
        .attr('stroke', d => this._getColor(d))
        .attr('fill', this.options.barInfo.fontColor)
        .attr('class', 'barInfo')
        .attr('y', 50)
        .attr('stroke-width', '0px')
        .attr('fill-opacity', 0)
        .style('font-size', `${this.options.barInfo.fontSize}px`)
        .style('font-weight', `${this.options.barInfo.fontWeight}`)
        .style('pointer-events', 'none')
        .transition()
        .delay(500 * this.interval_time / 3)
        .duration(2490 * this.interval_time / 3)
        .text(d => d.name)
        .attr('x', d => this.xScale(this.xValue(d)) - 10)
        .attr('fill-opacity', 1)
        .attr('y', barHeight / 2)
        .attr('dy', '0.2em')
        .attr('text-anchor', 'end')
        .attr('stroke-width', '2px')
        .attr('paint-order', 'stroke')
    }

    // BarValue
    if (this.options.barValue.show) {
      barEnter
        .append('text')
        .attr('x', 0)
        .attr('y', 50)
        .attr('fill-opacity', 0)
        .style('font-size', `${this.options.barValue.fontSize}px`)
        .style('font-weight', `${this.options.barValue.fontWeight}`)
        .style('fill', d =>
          this.options.barValue.fontColor === '='
            ? this._getColor(d)
            : this.options.barValue.fontColor
        )
        .transition()
        .duration(2990 * this.interval_time / 3)
        .tween('text', function (d) {
          const self = this
          // Start from 0.9 * d.value
          self.textContent = d.value * 0.9
          const i = d3.interpolate(self.textContent, Number(d.value)),
            prec = (Number(d.value) + '').split('.'),
            round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1
          return function (t) {
            self.textContent = d3.format(',.0f')(Math.round(i(t) * round) / round)
          }
        })
        .attr('fill-opacity', 1)
        .attr('class', 'value')
        .attr('x', d => this.xScale(this.xValue(d)) + 10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
    }

    let barUpdate = bar
      .transition('2')
      .duration(2990 * this.interval_time / 3)
      .ease(d3.easeLinear)

    barUpdate
      .select('rect')
      .style('fill', d => this._getColor(d))
      .attr('width', d => this.xScale(this.xValue(d)))

    // if (this.options.barLabel.show) {
    //   barUpdate
    //     .select('.label')
    //     .attr('class', 'label')
    //     .style('fill', d => this._getColor(d))
    //     .attr('width', d => this.xScale(this.xValue(d)))
    // }

    // barUpdate
    //   .select('.value')
    //   .attr('class', 'value')
    //   .style('fill', d => this._getColor(d))
    //   .attr('width', d => this.xScale(this.xValue(d)))

    // TODO: too long bar info should be avoided
    barInfo = barUpdate
      .select('.barInfo')
      .text(d => d.name)
      .attr('x', d => this.xScale(this.xValue(d)) - 10)

    barUpdate
      .select('.value')
      .tween('text', function (d) {
        const self = this
        const i = d3.interpolate(
          Number(self.textContent.replace(/,/g, '')),
          Number(d.value)
        )

        const prec = (Number(d.value) + '').split('.')
        const round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1
        return function (t) {
          self.textContent =
            d3.format(',.0f')(Math.round(i(t) * round) / round)
        }
      })
      .duration(2990 * this.interval_time / 3)
      .attr('x', d => this.xScale(this.xValue(d)) + 10)

    this.avg = (Number(this.currentData[0]['value']) +
      Number(this.currentData[this.currentData.length - 1]['value'])
    ) / 2

    let barExit = bar
      .exit()
      .attr('fill-opacity', 1)
      .transition()
      .duration(2500 * this.interval_time / 3)

    barExit
      .attr('transform', d => {
        // if (this.always_up) {
        //   return 'translate(0,' + '-100' + ')'
        // }
        // if (Number(d.value) > this.avg && this.allow_up) {
        //   return 'translate(0,' + '-100' + ')'
        // }
        // Always drop out
        return 'translate(0, 1000)'
      })
      .remove()
      .attr('fill-opacity', 0)

    barExit
      .select('rect')
      .attr('fill-opacity', 0)
      .attr('width', () => {
        // if (this.always_up) return this.xScale(0)
        return this.xScale(this.currentData[this.currentData.length - 1]['value'])
      })

    barExit
      .select('.value')
      .attr('fill-opacity', 0)
      .attr('x', () => {
        // if (this.always_up) return this.xScale(0)
        return this.xScale(this.currentData[this.currentData.length - 1]['value'])
      })

    barExit
      .select('.barInfo')
      .attr('fill-opacity', 0)
      .attr('stroke-width', '0px')
      .attr('x', () => {
        // if (this.always_up) return this.xScale(0)
        return this.xScale(this.currentData[this.currentData.length - 1]['value'])
      })
    barExit.select('.label').attr('fill-opacity', 0)
  }

  _change() {
    this.yScale
      .domain(this.currentData.map(d => d.name).reverse())
      .range([this.innerHeight, 0])

    this.g.selectAll('.bar')
      .data(this.currentData, d => d.name)
      .transition('1')
      .duration(
        this.isPlaying
          ? this.baseTime * this.update_rate * this.interval_time
          : this.baseTime * this.update_rate
      )
      .attr('transform', d => {
        return 'translate(0, ' + (this.yScale(this.yValue(d)) + 10) + ')'
      })
  }
}

export default RankingBar
