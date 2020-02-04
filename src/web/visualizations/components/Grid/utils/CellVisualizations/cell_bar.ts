import { Cell } from '../../../../types/query_response'
import { getVisualizationColor, QueryStat } from './cell_visualizations'

// TSLint doesnt know about super secret IE properties
const { documentMode } = document as any
const isIE11 = !!window.MSInputMethodContext && !!documentMode
const flexPrefix = isIE11 ? '-ms-' : ''

export interface CellVisualizationBar {
  is_active?: boolean
  selected_visualization?: string
  value_display?: boolean
  palette?: {
    collection_id: string
    palette_id: string
    custom_colors?: string[]
  }
}

export const getBar = (
  visualization: CellVisualizationBar,
  queryStats: QueryStat,
  cell: Cell,
  html: string
) => {
  const value = cell.value
  const min = queryStats.min || 0
  const max = queryStats.max || 0
  const textLength = queryStats.textLength || 0
  const spansZero = min * max < 0
  // bar starts at min and goes to max so need to subtract the min
  // from total bar length and bar value
  const subtractor = spansZero ? 0 : getSubtractor(queryStats)
  const barMax = getBarLength(queryStats, spansZero) - subtractor || 1
  const barValue =
    spansZero || value === null ? value : Math.abs(value) - subtractor
  const backgroundColor = getVisualizationColor(
    value,
    visualization,
    queryStats
  )
    .split(' ')
    .join('')
  const clickable = cell.links && cell.links.length > 0
  if (spansZero) {
    return getSpanZeroBar(
      barValue,
      queryStats,
      html,
      backgroundColor,
      barMax,
      textLength,
      visualization.value_display,
      clickable
    )
  }

  return getStandardBar(
    barValue,
    html,
    backgroundColor,
    barMax,
    textLength,
    visualization.value_display,
    clickable
  )
}

const getInnerStyle = (
  value: number,
  backgroundColor: string,
  extremum: number,
  inverseSide: string
) =>
  `background:${backgroundColor};width:${(value / extremum) *
    100}%;height:100%;float:${inverseSide};`

const getSpanZeroBar = (
  value: number,
  queryStats: QueryStat,
  html: string,
  backgroundColor: string,
  barMax: number,
  textLength: number,
  valueDisplay?: boolean,
  clickable?: boolean
) => {
  const min = queryStats.min || 0
  const max = queryStats.max || 0
  const flexMin = Math.abs(min) / barMax
  const flexMax = Math.abs(max) / barMax
  let leftBarStyle,
    rightBarStyle,
    innerLeftStyle = '',
    innerRightStyle = ''
  const barClassName = clickable
    ? ` class='cell-clickable-content bar-display'`
    : 'bar-display'
  leftBarStyle = `justify-content:flex-end;${flexPrefix}flex:${flexMin};content:'';align-self:auto;`
  rightBarStyle = `${flexPrefix}flex:${flexMax};content:'';align-self:auto;`
  if (value < 0) {
    innerLeftStyle = getInnerStyle(value, backgroundColor, min, 'right')
  } else {
    innerRightStyle = getInnerStyle(value, backgroundColor, max, 'left')
  }
  if (valueDisplay || valueDisplay === undefined) {
    return `<span class='bar-vis'><div class='bar-vis-left' style=${leftBarStyle}>
    <div style='padding-right:4px;-ms-flex:${1 -
      flexMin}; flex-basis:${textLength + 4}px;min-width:${textLength +
      4}px;justify-content:flex-end;height:100%;'>${value < 0 ? html : ''}</div>
    <div${barClassName} style=${innerLeftStyle}></div></div>
    <div class='bar-vis-right' style=${rightBarStyle}><div${barClassName} style=${innerRightStyle}></div>
    <div style='padding-left:4px;-ms-flex:${1 -
      flexMax}; flex-basis:${textLength + 4}px;width:${textLength +
      4}px;height:100%;'>${value >= 0 ? html : ''}</div></div></span>`
  } else {
    return `<span class='bar-vis'><div class='bar-vis-left' style=${leftBarStyle}>
    <div${barClassName} style=${innerLeftStyle}></div></div><div class='bar-vis-right' style=${rightBarStyle}>
    <div${barClassName} style=${innerRightStyle}></div></div></span>`
  }
}

const getStandardBar = (
  value: number | null,
  html: string,
  backgroundColor: string,
  barMax: number,
  textLength: number,
  valueDisplay?: boolean,
  clickable?: boolean
) => {
  let barStyle
  const barClassName = clickable
    ? ` class='cell-clickable-content bar-display'`
    : 'bar-display'
  if (valueDisplay || valueDisplay === undefined) {
    const flexPx = Math.abs(value !== null ? value : 0) / barMax
    barStyle = `background:${backgroundColor};${flexPrefix}flex:${flexPx};content:'';align-self:auto;`
    return `<span class='bar-vis'><div${barClassName} style=${
      value !== null ? barStyle : ''
    }></div>
    <div style='padding-left:4px; text-align:left;-ms-flex:${1 -
      flexPx}; flex-basis:${textLength + 4}px; min-width:${textLength +
      4}px'>${html}</div></span>`
  } else {
    barStyle = `background:${backgroundColor};width:${(Math.abs(
      value !== null ? value : 0
    ) /
      barMax) *
      100}%;height:100%;display:list-item;`
    return `<span class='bar-vis'><div${barClassName} style=${
      value !== null ? barStyle : ''
    }/></span>`
  }
}

const getSubtractor = (queryStats: QueryStat) => {
  const min = queryStats.min || 0
  const max = queryStats.max || 0
  if (min < 0) {
    return Math.abs(max)
  }
  return min
}

// gets maximum bar length
const getBarLength = (queryStats: QueryStat, spansZero: boolean) => {
  const min = queryStats.min || 0
  const max = queryStats.max || 0
  let barMax = max <= 0 ? Math.abs(min) : Math.abs(max)
  if (spansZero) {
    barMax = Math.abs(min) + Math.abs(max)
  }
  return barMax
}
