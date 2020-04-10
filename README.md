# Ranking Bar

[简体中文](https://github.com/ryancui-/ranking-bar/blob/master/README-zh.md)

Use it the same as ECharts.

> This project is based on https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js, thanks for your ideas.

Though, this project has many different configuration than the original due to my requirement, perhaps not suitable for your case, please refer to `Options` chapter for more information.

## Install

```bash
npm install -S @ryancui-/ranking-bar
```

**ATTENTION**, you need to ensure the global variable `d3` is avaliable(v5).

## Usage

First, You need a `<svg>` element with specific height and width. Besides, `viewBox` is not required.

```html
<svg id="chart" width="600" height="350"></svg>
```

Then, initialize like ECharts:

```js
import { RankingBar } from '@ryancui-/ranking-bar'

const dom = document.getElementById('chart')
const options = { /*...*/ }

const instance = new RankingBar(dom)

instance.render(options)

instance.play()
```

### Options

```js
const options = {
  // Render data, see dataset chapter
  data: [],
  // Image data above the bar, see dataset chapter  
  imgMapping: [],
  // Color palette，support single color, linear gradient（0%-100%）
  color: ['#00bcbe', ['#00bcbe', 'rgba(0, 188, 190, 0.2)']],
  // Animation duration(ms) for each time tick
  duration: 1000,
  // Default time tick, start means at the beginning of the time, end means at the end
  init: 'start',
  // Max bar number(same as TopN)
  rankingCount: 20,
  // Grid distances to four directions
  grid: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  // Tooltip
  tooltip: {
    show: true,
    formatter: (d3, dataItem) => `${dataItem.name} - ${dataItem.value}`
  },
  // X axis
  xAxis: {
    show: true,
    fontSize: 12,
    fontColor: '#999',
    fontWeight: 'normal',
    tickColor: '#F0F0F0',   // Tick line color
    tickType: 'solid',      // Tick line type: solid / dashed
    tickFormatter: (d3, value) => d3.format('~s')(value).toUpperCase()
  },
  // Time(event) tick label in right-bottom corner
  eventLabel: {
    show: false,
    fontSize: 28,
    fontColor: '#2b2b2b',
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.date
  },
  // Bar options  
  bar: {
    height: 'auto',   // Bar height, auto means self-adjusted, or provide a fixed pixel number
    round: 0          // Bar border radius
  },
  // Bar label(same as y axis)
  barLabel: {
    show: true,
    fontSize: 12,
    fontColor: '=',   // = means follow the bar serie color, or provide specific one
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.name
  },
  // Bar info text(above the bar)
  barInfo: {
    show: true,
    fontSize: 12,
    fontColor: '#fff',
    fontWeight: 'normal',
    formatter: (d3, datum) => `${datum.name} - ${datum.type}`
  },
  // Bar value(after the bar)
  barValue: {
    show: true,
    fontSize: 12,
    fontColor: '=',   // = means follow the bar serie color, or provide specific one
    fontWeight: 'normal',
    prefix: '',       // prefix the value
    postfix: ''       // postfix the value
  },
  // Bar image(above the bar)
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
```

### Dataset

`options.data`:

```typescript
interface Serie {
  date: string;
  name: string;
  type: string;
  value: string | number;
}

const data: Serie[] = [{
  date: '2019-01-01',    // Time tick, string
  name: 'China',         // Serie, for different bar
  type: 'Asia',          // Type, for different color
  value: 19384           // Value
}, {
  date: '2019-01-01',
  name: 'Korea',
  type: 'Asia',
  value: 8475
}, /*...*/]
```

`options.imgMapping`:

```typescript
interface ImgMapping {
  name: string;
  img: string;
}

const imgMapping: ImgMapping[] = [{
  name: 'China',                    // Serie
  img: 'http://path/to/your/image'  // Image url
}, /*...*/]
```

### Methods

```js
// Render the chart
instance.render(options)

// Start the animation from the beginning
instance.play()
```

### Events

Use `on`/`off` to add/remove event listeners.

```js
instance.on('click', (params) => {})

instance.off('click')
```

#### `click`

Fired when click the bar.

```typescript
instance.on('click', ({ datum: Serie }) => {
  console.log(datum)  // datum is the object in options.data  
})
```

#### `eventTick`

Fired when a new time(event) tick starts, you can use this to synchronize the outside status.

```typescript
instance.on('eventTick', ({ date: string }) => {
  console.log(date)  // Current time tick  
})
```

#### `stop`

Fired when animation finishs.

```typescript
instance.on('stop', () => {
    
})
```