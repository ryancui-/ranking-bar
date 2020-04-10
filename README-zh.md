# 竞速条形图

像 ECharts 一样使用。

> 这个包主要对 https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js 做了一层封装，并根据我自己项目的需要增删改了不少配置项，请根据需要使用。

更多配置项请阅读 `选项` 章节。

## 安装

```bash
npm install -S @ryancui-/ranking-bar
```

**注意**: 必须保证有 `d3` 全局变量（v5 版本），这个包没有提供 `d3` 的依赖。

你可以通过 CDN 或 npm 包等方法获取 D3.js，然后放到全局变量中，如

```js
import d3 from 'd3'

window.d3 = d3
```

## 用法

写一个带有 `width`/`height` 的 `<svg>` 元素，不必使用 `viewBox` 属性。

```html
<svg id="chart" width="600" height="350"></svg>
```

然后，跟 ECharts 一样初始化：

```js
import { RankingBar } from '@ryancui-/ranking-bar'

const dom = document.getElementById('chart')
const options = { /*...*/ }

const instance = new RankingBar(dom)

instance.render(options)

instance.play()
```

### 选项

```js
const options = {
  // 需要渲染的数据，格式见「数据格式」一节
  data: [],
  // 柱子上图片映射数据，格式见「数据格式」一节  
  imgMapping: [],
  // 色盘，支持单色、线性渐变（0%-100%）两种
  color: ['#00bcbe', ['#00bcbe', 'rgba(0, 188, 190, 0.2)']],
  // 每一个时间切片动画的持续时间（毫秒）
  duration: 1000,
  // 初始化图表显示，start 为显示最初的时间点；end 为显示最末时间点
  init: 'start',
  // 每一个时间切片最多渲染多少组数据（相当于 TopN）
  rankingCount: 20,
  // 画布离四边的距离
  grid: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  // Tooltip 配置
  tooltip: {
    show: true,
    formatter: (d3, dataItem) => `${dataItem.name} - ${dataItem.value}`
  },
  // x 轴配置
  xAxis: {
    show: true,
    fontSize: 12,
    fontColor: '#999',
    fontWeight: 'normal',
    tickColor: '#F0F0F0',   // 分隔线颜色
    tickType: 'solid',      // 分隔线线型 solid / dashed
    tickFormatter: (d3, value) => d3.format('~s')(value).toUpperCase()
  },
  // 右下角当前时间切片配置
  eventLabel: {
    show: false,
    fontSize: 28,
    fontColor: '#2b2b2b',
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.date
  },
  // 条形图配置  
  bar: {
    height: 'auto',   // 柱高，auto 为自适应，可使用 number 指定像素值
    round: 0          // 柱子圆角，像素值
  },
  // 柱子侧边的标签（相当于 y 轴标签）
  barLabel: {
    show: true,
    fontSize: 12,
    fontColor: '=',   // = 表示跟随柱子颜色，亦可指定统一颜色
    fontWeight: 'normal',
    formatter: (d3, datum) => datum.name
  },
  // 柱子上的标签
  barInfo: {
    show: true,
    fontSize: 12,
    fontColor: '#fff',
    fontWeight: 'normal',
    formatter: (d3, datum) => `${datum.name} - ${datum.type}`
  },
  // 柱子边的数值
  barValue: {
    show: true,
    fontSize: 12,
    fontColor: '=',   // = 表示跟随柱子颜色，亦可指定统一颜色
    fontWeight: 'normal',
    prefix: '',       // 添加在值的前缀
    postfix: ''       // 添加在值的后缀
  },
  // 柱子上的图片
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

### 数据格式

`options.data` 格式如下：

```typescript
interface Serie {
  date: string;
  name: string;
  type: string;
  value: string | number;
}

const data: Serie[] = [{
  date: '2019-01-01',    // 时间切片，字符串
  name: 'China',         // 系列名称，区分不同柱子
  type: 'Asia',          // 类型名称，区分不同颜色 
  value: 19384           // 值
}, {
  date: '2019-01-01',
  name: 'Korea',
  type: 'Asia',
  value: 8475
}, /*...*/]
```

`options.imgMapping` 格式如下，注意图片与系列一一对应：

```typescript
interface ImgMapping {
  name: string;
  img: string;
}

const imgMapping: ImgMapping[] = [{
  name: 'China',                    // 系列名称
  img: 'http://path/to/your/image'  // 图片路径
}, /*...*/]
```

### 方法

```js
// 渲染图表
instance.render(options)

// 播放动画
instance.play()
```

### 事件

使用 `on`/`off` 方法来监听事件：

```js
instance.on('click', (params) => {})

instance.off('click')
```

#### `click`

点击柱子时触发。

```typescript
instance.on('click', ({ datum: Serie }) => {
  console.log(datum)  // datum 就是 data 中对应点击柱子的对象  
})
```

#### `eventTick`

开始下一个时间切片动画时触发，常用于外部状态协同。

```typescript
instance.on('eventTick', ({ date: string }) => {
  console.log(date)  // 当前时间切片  
})
```

#### `stop`

动画播放结束事件。

```typescript
instance.on('stop', () => {
    
})
```