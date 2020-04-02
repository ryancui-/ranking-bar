interface Serie {
  date: string;
  name: string;
  type: string;
  value: string;
}

interface ImgMapping {
  name: string;
  img: string;
}

interface EventMapping {
  date: string;
  eventTitle: string;
  eventDesc: string;
}

type RankingBarData = Serie[]

interface Options {
  data: RankingBarData;
  imgMapping: ImgMapping[];
  eventMapping: EventMapping[];
  color: (string | string[])[];
  duration: number;
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
    tickColor: string;
    tickType: 'solid' | 'dashed';
    tickFormatter: Function;
  },
  eventLabel: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
    formatter: Function;
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
    formatter: Function;
  },
  barInfo: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
    formatter: Function;
  },
  barValue: {
    show: boolean;
    fontSize: number;
    fontColor: string;
    fontWeight: string;
    prefix: string;
    postfix: string;
  }
}

export {
  Serie,
  RankingBarData,
  Options
}
