import { Column, GridApi, ICellRendererFunc, RowNode } from 'ag-grid-community'
import {
  Cell,
  Field,
  PivotCell,
  QueryResponse,
} from 'web/visualizations/types/query_response'
import { valueFormatter } from 'web/visualizations/components/Grid/utils/chart_utils'
import { VisConfig } from '../../../types/vis_config'
import { LookerColDef, ValueFormatByField } from '../types/grid_types'
import {
  DEFAULT_HEADER_HEIGHT,
  HEADER_WIDTH_BUFFER,
  LINE_HEIGHT_MULTIPLIER,
} from './grid_constants'

export const getCellValue: ICellRendererFunc = obj => {
  if (!obj.value && obj.data) {
    // Transpose has a column that is an odd duck. It doesn't actually have a field
    // So we can't get the value out
    return obj.data[obj.colDef.colId]
  } else {
    // Everybody else just has a value
    return obj.value
  }
}

/*
 * This strips the grouping string for subtotals and also the pivot key,
 * leaving only the name of the field
 */
export const getFieldFromColumn = (column: Column) => {
  const colDef = column.getColDef() as LookerColDef
  return getFieldFromColDef(colDef)
}

export const getFieldFromColDef = (colDef: LookerColDef) => {
  let field = stripGrouping(colDef.colId as string)
  if (field && colDef.pivotKey) {
    field = field.replace(`${colDef.pivotKey}_`, '')
  }
  return field
}

export const innerStringParser = (
  column: LookerColDef,
  config: VisConfig,
  node: RowNode,
  value?: string
) => {
  // return blank if there is no value
  if (!value) {
    return ''
  }
  // Try and recreate the rendered value from scratch with dataValue and the value formatter
  if (column.colId && node.data && node.data[column.colId]) {
    const dataValue = node.data[column.colId].value
    return config.series_value_format &&
      config.series_value_format[column.colId]
      ? valueFormatter(
          dataValue,
          config.series_value_format[column.colId].format_string
        )
      : node.data[column.colId].rendered || dataValue
  }
  // If not able to recreate the value just grab the html and parse out the textContent
  const domParser = new DOMParser()
  return (
    domParser.parseFromString(value, 'text/html').documentElement.textContent ||
    ''
  )
}

export const cellStyleGlobal = (
  config: VisConfig,
  camelCase: boolean = false
) => {
  const fs = camelCase ? 'fontSize' : 'font-size'
  const lh = camelCase ? 'lineHeight' : 'line-height'
  return {
    [fs]: `${config.rows_font_size}px`,
    [lh]: `${LINE_HEIGHT_MULTIPLIER}`,
  }
}

/*
 * This strips the grouping string for subtotals but leaves in the value of
 * the pivot field rather than strip it out, in the format ${pivotKey}_${colId}
 */
export const getFullFieldFromColumn = (column: Column) => {
  const colDef = column.getColDef() as LookerColDef
  return stripGrouping(colDef.colId as string)
}

export const fieldsFromQueryResponse = (queryResponse: QueryResponse) => {
  const { fields } = queryResponse
  return Object.keys(fields).reduce(
    (arr, key) => arr.concat(fields[key]),
    [] as Field[]
  )
}

/*
 * Converts a value if the given field name corresponds to a format entry in a
 * `ValueFormatByField` value. Used to enable custom value formatting for the table.
 * Convert to the specified custom value format UNLESS we've got a measure/calc with
 * no corresponding override (preserve original format).
 */
export const convertValueFormat = (
  cell: Cell | PivotCell,
  field: Field,
  valueFormat: ValueFormatByField,
  numberFormat?: string
): string => {
  const { rendered, value } = cell
  if (!field.is_numeric) return `${rendered || value}`

  if (
    (field.is_table_calculation || field.measure) &&
    !valueFormat[field.name]
  ) {
    valueFormat[field.name] = { format_string: field.value_format }
  }

  const format = valueFormat[field.name]
  let formatString
  if (typeof format === 'string') {
    formatString = format
  } else if (format) {
    formatString = format.format_string
  }
  return valueFormatter(value, formatString, numberFormat)
}

const stripGrouping = (field: string): string =>
  field && field.includes('grouped-column-')
    ? field.replace('grouped-column-', '')
    : field

export const addRowExpandClass = (classes: string, isExpanded: boolean) => {
  const className = isExpanded ? 'row-truncated' : 'row-expanded'
  return (classes += ` ${className}`)
}

// DX-520 This removes the gap between totals and the data if there arent many rows
export const totalsPlacement = (api: GridApi) => {
  if (!api.getPinnedBottomRow(0)) return
  api.setDomLayout('normal')
  const lastRow = api.getRowNode(`${api.getLastDisplayedRow()}`)
  const rowRange = api.getVerticalPixelRange()
  if (
    lastRow &&
    lastRow.rowHeight + lastRow.rowTop < rowRange.bottom - rowRange.top
  ) {
    api.setDomLayout('autoHeight')
  }
}

/**
 * The height of for a header that fits on a single line
 *
 * @param headerFontSize font size to render text in
 */
const singleLineHeaderHeight = (headerFontSize: number) =>
  Number(headerFontSize) * LINE_HEIGHT_MULTIPLIER || DEFAULT_HEADER_HEIGHT

export const computeFixedHeightForHeader = (config: VisConfig) => {
  // Compute number of rows which constitute the header.
  // If there are pivots, this should be the number of pivots. Or else assume 1.
  const headerRowsCount =
    config.query_fields &&
    config.query_fields.pivots &&
    config.query_fields.pivots.length
      ? config.query_fields.pivots.length
      : 1

  return singleLineHeaderHeight(config.header_font_size) * headerRowsCount
}

/**
 * Calculate the height needed to render header text
 *
 * @param headerFontSize font size to render text in
 * @param eGui the div element that contains text
 * @param actualWidth The actual width of eGui element
 */
export const computeTextHeightForHeader = (
  headerFontSize: number,
  eGui: HTMLDivElement | null,
  actualWidth: number
) => {
  if (eGui) {
    const innerText = eGui.innerText || ''
    const totalChars = innerText.length
    const charsPerLine = Math.max(
      1,
      ((actualWidth - HEADER_WIDTH_BUFFER) * LINE_HEIGHT_MULTIPLIER) /
        Number(headerFontSize)
    )
    return (
      Math.ceil(totalChars / charsPerLine) *
      singleLineHeaderHeight(headerFontSize)
    )
  } else {
    return singleLineHeaderHeight(headerFontSize)
  }
}
