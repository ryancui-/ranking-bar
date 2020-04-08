# Ranking Bar

**NOTE:** It is still under-developing.

Use it the same as ECharts.

> This project is based on https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js, thanks for your ideas.

Though, this project has many different configuration than the original due to my requirement, perhaps not suitable for your case, please read about the `Options` chapter for more information.

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