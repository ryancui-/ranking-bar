# Ranking Bar

[简体中文](https://github.com/ryancui-/ranking-bar/blob/master/README-zh.md)

Use it the same as ECharts.

> This project is based on https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js, thanks for your ideas.

Though, this project has many different configuration than the original due to my requirement, perhaps not suitable for your case, please read about the `Options` chapter for more information.

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
const options = {}  // Options, like echarts

const instance = new RankingBar(dom)

// Now the graph is rendered
instance.render(options)

// Start animations
instance.play()
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
instance.render(options)

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