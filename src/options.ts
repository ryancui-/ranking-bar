interface Options {
  color: any[];
  init: 'start' | 'end';
  rankingCount: number;
  grid: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  },
  tooltip: {
    show: boolean;
    formatter: Function;
  }
  xAxis: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
    tickCount: number;
    tickColor: string;
    tickFormat: Function;
  },
  eventLabel: {
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  },
  eventTitle: {
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  },
  eventDesc: {
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  },
  bar: {
    height: 'auto' | number;
    round: number;
  },
  barLabel: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  },
  barInfo: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  },
  barValue: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
  }
}

const defaultOptions: Options = {
  color: [],
  init: 'start',
  rankingCount: 4,
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
    tickCount: 8,
    tickColor: '#F0F0F0',
    tickFormat: (d3, value) => d3.format('~s')(value).toUpperCase()
  },
  eventLabel: {
    fontSize: 28,
    fontColor: '#2b2b2b',
    fontWeight: 'normal'
  },
  eventTitle: {
    fontSize: 28,
    fontColor: '#666',
    fontWeight: 'normal'
  },
  eventDesc: {
    fontSize: 18,
    fontColor: '#999',
    fontWeight: 'normal'
  },
  bar: {
    height: 'auto',
    round: 0
  },
  barLabel: {
    show: true,
    fontSize: 12,
    fontColor: '=',
    fontWeight: 'normal'
  },
  barInfo: {
    show: true,
    fontSize: 12,
    fontColor: '#fff',
    fontWeight: 'normal'
  },
  barValue: {
    show: true,
    fontSize: 12,
    fontColor: '=',
    fontWeight: 'normal'
  }
}

export {
  Options,
  defaultOptions
}
