import { defaultOptions } from './options'
import { Serie, RankingBarData, Options } from './types-def'

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
  currentData: Serie[]
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
  reverse: boolean
  interval_time: number
  big_value: boolean
  update_rate: number
  showLabel: boolean
  format: string
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
  isDateRanking: boolean

  eventLabel: any
  gradientDefs: any;

  cbs: object

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
    this.reverse = false
    this.interval_time = 1.5

    this.big_value = false
    this.update_rate = 0.5

    this.showLabel = true

    this.format = ',.0f'

    this.isPlaying = false
    this.dom = dom
    this.svg = d3.select(dom)
    this.cbs = {}

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
  render(options: Object, forceUpdate: boolean) {
    // TODO: Currently just remove everything and render again
    if (this.svg) {
      this.svg.selectAll('*').remove()
    }

    // Merge default options
    this.options = deepMerge(defaultOptions, options) as Options

    if (forceUpdate) {
      this.colorMapping = {}
    }

    // If use gradient color...
    this.gradientDefs = this.svg.append('defs')
    this.options.color.forEach((color, index) => {
      if (Array.isArray(color)) {
        const gradient = this.gradientDefs.append('linearGradient')
          .attr('id', `gradient_${index}`)

        gradient.append('stop').attr('offset', '0%').attr('stop-color', color[0])
        gradient.append('stop').attr('offset', '100%').attr('stop-color', color[1])
      }
    })

    this.data = this.options.data.slice(0)
    this.date = []
    this.names = []
    this.lastData = []

    this.data.forEach(element => {
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
      .tickFormat(v => this.options.xAxis.tickFormatter(d3, v))
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
        console.log('STOP HERE!!!')
        // Return to the first event
        if (this.options.init === 'start') {
          this.currentdate = this.time[0]
          this.getCurrentData(this.time[0])
          setTimeout(() => {
            this.emit('stop')
          }, this.options.duration)
        } else {
          this.emit('stop')
        }
        return
      }

      this.isPlaying = true
      this.currentdate = this.time[this.nextIndex]
      this.getCurrentData(this.time[this.nextIndex])
      this.nextIndex++
      this.playTimer = setTimeout(execute, this.options.duration + 200)
    }

    clearTimeout(this.playTimer)
    if (this.options.init === 'end') {
      this.g.selectAll('.bar').remove()
      this.xAxisG.selectAll('.tick').remove()
      this.g.select('.eventLabel').remove()
      this.nextIndex = 0
    } else {
      this.nextIndex = 1
    }
    execute()
  }

  /**
   * Binding event
   *
   * @param event
   * @param cb
   */
  on(event: string, cb: Function) {
    if (!this.cbs[event]) this.cbs[event] = []
    this.cbs[event].push(cb)
  }

  off(event: string, cb: Function) {
    if (this.cbs[event]) {
      this.cbs[event] = this.cbs[event].filter(_ => _ !== cb)
    }
  }

  emit(event: string, params?: any) {
    if (this.cbs[event]) {
      for (let cb of this.cbs[event]) {
        cb(params)
      }
    }
  }

  getCurrentData(date) {
    this.emit('eventTick', { date })
    this.rate = []
    this.currentData = []
    this.indexList = []

    this.data.forEach(element => {
      if (element['date'] === date && parseFloat(element['value']) != 0) {
        this.currentData.push(element)
      }
    })
    this.currentData = this.currentData.slice(0, this.options.rankingCount)
    this._dataSort()

    d3.transition('2')
      .each(this._redraw.bind(this))
      .each(this._change.bind(this))
    this.lastData = this.currentData
  }

  _getColor(d) {
    if (this.colorMapping[d.type]) {
      return this.colorMapping[d.type]
    }

    const newIndex = Object.keys(this.colorMapping).length % this.options.color.length
    if (Array.isArray(this.options.color[newIndex])) {
      return this.colorMapping[d.type] = `url(#gradient_${newIndex})`
    } else {
      return this.colorMapping[d.type] = this.options.color[newIndex]
    }
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
    if (this.options.eventLabel.show) {
      const eventLabel = this.g.select('.eventLabel')
      if (eventLabel.empty()) {
        this.eventLabel = this.g.insert('text')
          .data(this.currentdate)
          .attr('class', 'eventLabel')
          .attr('style:visibility', 'visible')
          .attr('x', this.innerWidth - 5)
          .attr('y', this.innerHeight - 5)
          .style('fill', this.options.eventLabel.fontColor)
          .style('font-size', `${this.options.eventLabel.fontSize}px`)
          .style('font-weight', this.options.eventLabel.fontWeight)
          .attr('text-anchor', 'end')
          .text(this.currentdate)

        this.eventLabel.style('opacity', 0)
          .transition()
          .duration(this.options.duration)
          .ease(d3.easeLinear)
          .style('opacity', 1)
      } else if (this.isDateRanking) {
        this.eventLabel
          .data(this.currentData)
          .transition()
          .duration(this.options.duration)
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
        this.eventLabel.text(this.currentdate)
      }
    }

    // xAxis ticks animations
    this.xAxisG
      .transition()
      .duration(this.options.duration)
      .ease(d3.easeLinear)
      .call(this.xAxis)

    this.xAxisG.selectAll('.tick > text')
      .style('font-size', `${this.options.xAxis.fontSize}px`)
      .style('font-weight', this.options.xAxis.fontWeight)
      .style('fill', this.options.xAxis.fontColor)

    this.xAxisG.selectAll('.tick > line')
      .style('stroke', this.options.xAxis.tickColor)
    if (this.options.xAxis.tickType === 'dashed') {
      this.xAxisG.selectAll('.tick > line')
        .style('stroke-dasharray', '5')
    }

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

    const barValuePrefix = this.options.barValue.prefix
    const barValuePostfix = this.options.barValue.postfix

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
      .on('click', datum => {
        this.emit('click', { datum })
      })
      .style('fill', d => this._getColor(d))
      .transition('a')
      .delay(this.options.duration / 6)
      .duration(this.options.duration * 5 / 6)
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
        .delay(this.options.duration / 6)
        .duration(this.options.duration * 5 / 6)
        .attr('fill-opacity', 1)
        .attr('y', 0)
        .attr('class', 'label')
        .attr('x', -10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .text(datum => this.options.barLabel.formatter(d3, datum))
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
        .delay(this.options.duration / 6)
        .duration(this.options.duration * 5 / 6)
        .text(datum => this.options.barInfo.formatter(d3, datum))
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
        .duration(this.options.duration - 10)
        .tween('text', function (d) {
          const self = this
          // Start from 0.9 * d.value
          const prevValue = d.value * 0.9
          self.textContent = `${barValuePrefix}${prevValue}${barValuePostfix}`
          const i = d3.interpolate(prevValue, Number(d.value)),
            prec = (Number(d.value) + '').split('.'),
            round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1
          return function (t) {
            const value = d3.format(',.0f')(Math.round(i(t) * round) / round)
            self.textContent = `${barValuePrefix}${value}${barValuePostfix}`
          }
        })
        .attr('fill-opacity', 1)
        .attr('class', 'value')
        .attr('x', d => this.xScale(this.xValue(d)) + 10)
        .attr('y', barHeight / 2)
        .attr('dy', '0.35em')
    }

    if (this.options.imgMapping.length > 0) {
      barEnter
        .append('defs')
        .append('pattern')
        .attr('id', d => d.name)
        .attr('width', '100%')
        .attr('height', '100%')
        .append('image')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', barHeight * 2)
        .attr('height', barHeight * 2)
        .attr('href', d => {
          const mapping = this.options.imgMapping.find(_ => _.name === d.name)
          return mapping ? mapping.img : ''
        })
      barEnter
        .append('circle')
        .attr('fill-opacity', 0)
        .attr('cy', 63)
        .attr('fill',
          d =>
            'url(#' +
            encodeURIComponent(d.name)
              .replace('\'', '%27')
              .replace('(', '%28')
              .replace(')', '%29') +
            ')'
        )
        .attr('stroke-width', '0px')
        .transition('a')
        .delay(this.options.duration / 6)
        .duration(this.options.duration * 5 / 6)
        .attr('cx', d => this.xScale(this.xValue(d)) - 20)
        .attr('cy', barHeight / 2 - 1)
        .attr('r', barHeight)
        .attr('fill-opacity', 1)
    }

    // 2. Animation exists
    let barUpdate = bar
      .transition('2')
      .duration(this.options.duration - 10)
      .ease(d3.easeLinear)

    barUpdate
      .select('rect')
      .style('fill', d => this._getColor(d))
      .attr('width', d => this.xScale(this.xValue(d)))

    // TODO: too long bar info should be avoided
    barInfo = barUpdate
      .select('.barInfo')
      .attr('x', d => this.xScale(this.xValue(d)) - 10)

    barUpdate
      .select('.value')
      .tween('text', function (d) {
        const self = this
        const numberText = self.textContent.substring(
          barValuePrefix.length,
          self.textContent.length - barValuePostfix.length
        )
        const prevValue = Number(numberText.replace(/,/g, ''))
        const i = d3.interpolate(prevValue, Number(d.value))

        const prec = (Number(d.value) + '').split('.')
        const round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1
        return function (t) {
          const value = d3.format(',.0f')(Math.round(i(t) * round) / round)
          self.textContent = `${barValuePrefix}${value}${barValuePostfix}`
        }
      })
      .duration(this.options.duration - 10)
      .attr('x', d => this.xScale(this.xValue(d)) + 10)

    barUpdate
      .select('circle')
      .attr('cx', d => this.xScale(this.xValue(d)) - 20)

    this.avg = (Number(this.currentData[0]['value']) +
      Number(this.currentData[this.currentData.length - 1]['value'])
    ) / 2

    // 3. Animation exit
    let barExit = bar
      .exit()
      .attr('fill-opacity', 1)
      .transition()
      .duration(this.options.duration - 50)

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
    barExit.select('circle').attr('fill-opacity', 0)
  }

  _change() {
    this.yScale
      .domain(this.currentData.map(d => d.name).reverse())
      .range([this.innerHeight, 0])

    this.g.selectAll('.bar')
      .data(this.currentData, d => d.name)
      .transition('1')
      .duration(this.options.duration)
      .attr('transform', d => {
        return 'translate(0, ' + (this.yScale(this.yValue(d)) + 10) + ')'
      })
  }
}

export default RankingBar
