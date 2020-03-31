interface Options {
  color?: any[];
  xAxis?: {
    show?: boolean;
  },
  yAxis?: {
    show?: boolean;
  }
}

const defaultOptions: Options = {}

export {
  Options,
  defaultOptions
}
