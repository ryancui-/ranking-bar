# Ranking Bar

Use it the same as ECharts.

> This project is based on https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js, thanks for your ideas.

## Install

```bash
npm install -S @ryc/ranking-bar
```

**ATTENTION**, you need to ensure variable `d3` is avaliable(v5) and currently this repo just provides the source code version.

## Usage

First, You need a `<svg>` element with specific height and width. Besides, `viewBox` is not required.

```html
<svg id="chart" width="600" height="350"></svg>
```

Then, initialize like ECharts:

```js
import { RankingBar } from '@ryc/ranking-bar'

const dom = document.getElementById('chart')
const options = {}  // Options, see below~
const data = []     // Data, see below~

const instance = new RankingBar(dom, options)

instance.render(data)
instance.play()
```

### Data Format

```js
const data = [{
  date: '2020-01-01',
  name: 'Chinese',
  value: 12000
}, {
  date: '2020-01-01',
  name: 'English',
  value: 14000
}, {
  date: '2020-01-01',
  name: 'Russian',
  value: 42000
}]
```

### Options

```js
const options = {
  // TODO
}
```

### Methods

```js
// Render the chart
instance.render(data)

// Start the animation from the beginning
instance.play()
```

### Events

```js
instance.on('click', params => {
  console.log(
    params.event,   // Event fired
    params.data     // Clicked data
  )
})
```