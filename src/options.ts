import { Options } from './types-def'

const defaultOptions: Options = {
  data: [],
  imgMapping: [],
  color: [],
  duration: 1000,
  init: 'start',
  rankingCount: 20,
  grid: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  tooltip: {
    show: true,
    formatter: (d3, dataItem) => `${dataItem.name} - ${dataItem.value}`
  },
  xAxis: {
    show: true,
    fontSize: 12,
    fontColor: '#999',
    fontWeight: 'normal',
    tickColor: '#F0F0F0',
    tickType: 'solid',
    tickFormatter: (d3, value) => d3.format('~s')(value).toUpperCase()
  },
  eventLabel: {
    show: false,
    fontSize: 28,
    fontColor: '#2b2b2b',
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.date
  },
  bar: {
    height: 'auto',
    round: 0
  },
  barLabel: {
    show: true,
    fontSize: 12,
    fontColor: '=',
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.name
  },
  barInfo: {
    show: true,
    fontSize: 12,
    fontColor: '#fff',
    fontWeight: 'normal',
    formatter: (d3, datum) => `${datum.name} - ${datum.type}`
  },
  barValue: {
    show: true,
    fontSize: 12,
    fontColor: '=',
    fontWeight: 'normal',
    prefix: '',
    postfix: ''
  },
  barImage: {
    show: false,
    borderColor: 'transparent',
    borderWidth: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: 'transparent'
  }
}

export {
  defaultOptions
}
