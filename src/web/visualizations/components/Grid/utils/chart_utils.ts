// TODO
// import { numberLocalization } from 'assets/common/format_localization/number_format'
import escape from 'lodash/escape'
import keys from 'lodash/keys'
import { Cell, Data, Field, Link, Pivot, Row } from '../../../types/query_response'
import { VisConfig } from '../../../types/vis_config'

export function valueFormatter(
  value?: number | string | Date,
  format?: string,
  userFormat?: string,
  maxDecimals?: number
): string {
  if (format) return valueFormatSafe(value, format, userFormat) as any // TODO
  return defaultFormatter(value, userFormat, maxDecimals)
}

export function defaultFormatter(
  value?: number | string | Date,
  userFormat?: string,
  maxDecimals?: number
): string {
  if (typeof value === 'undefined') return ''

  // truncate trailing 0s
  const float = Number(value)
  if (isNaN(float)) return value.toString()
  let s = float.toString()
  // truncate to maxDecimals if needed
  if (maxDecimals) s = Number(float.toFixed(maxDecimals)).toString()
  // Insert thousands/decimal separator
  return s
  // return numberLocalization(s, undefined, userFormat, true)
}

export function fieldLabelHtml(
  field: Field,
  options: VisConfig = {},
  allFields: { [key: string]: Field[] } | null = null
) {
  if (
    optionsAllowShowViewNames(options) &&
    field.view_label &&
    field.label_short
  ) {
    return `${escape(field.view_label)} <b>${escape(field.label_short)}</b>`
  } else {
    return escape(fieldLabel(field, options, allFields))
  }
}

export function fieldLabel(
  field: Field,
  options: VisConfig = {},
  allFields: { [key: string]: Field[] } | null = null
) {
  if (optionsAllowShowViewNames(options)) {
    return field.label || field.name
  } else {
    return shortFieldLabel(field, options, allFields)
  }
}

export function shortFieldLabel(
  field: Field,
  options: VisConfig = {},
  allFields: { [key: string]: Field[] } | null = null
) {
  if (!optionsAllowShowViewNames(options)) {
    if (allFields && field.view_label && field.measure) {
      if (field.label_short === 'Count') {
        return field.view_label
      }
      if (allFields.measures && allFields.measures.length > 1) {
        const uniqueShortNames = [
          ...new Set(allFields.measures.map(f => f.label_short)),
        ]
        if (uniqueShortNames.length === 1 && uniqueShortNames[0]) {
          return field.view_label
        } else if (uniqueShortNames.length !== allFields.measures.length) {
          const sameLabels = allFields.measures.filter(
            f => f.label_short === field.label_short
          )
          if (sameLabels.length > 1) {
            return field.label
          }
        }
      }
    }
  }

  return field.label_short || field.label || field.name
}

const optionsAllowShowViewNames = (options: VisConfig) =>
  options.useUnscopedLabels === false || options.show_view_names === true

export function pivotName(pivot: Pivot) {
  return keys(pivot.data)
    .reduce((name, key) => {
      name.push(textForCell(pivot.metadata[key] as any))
      return name
    }, [] as string[])
    .join(' - ')
}

function textForCell(cell: Cell) {
  if (cell.value !== null) {
    return cell.rendered || `${cell.value}`
  } else {
    return '∅'
  }
}

export function pivotKey(pivot: Pivot) {
  return pivot.key.replace(/\|FIELD\|/, ' - ')
}

export function valueFormat(
  value?: string | number | Date,
  format?: string,
  userFormat?: string
) {
  return value
  // numberLocalization calls ssf and then localizes the output
  // return numberLocalization(value, format, userFormat, false)
}

export function valueFormatSafe(
  value?: string | number | Date,
  format?: string,
  userFormat?: string
) {
  if (!format) return `${value}`
  try {
    return valueFormat(value, format, userFormat)
  } catch {
    return `${value}`
  }
}

export function pivotLinks(pivot: Pivot) {
  return keys(pivot.data).reduce(
    (links, key) => links.concat((pivot.metadata[key].links as Link[]) || []),
    [] as Link[]
  )
}

export function getVisibleDataRangeFromVisConfig(
  data: Data,
  config: VisConfig
) {
  const isInteger = (num: string) => parseFloat(num) && +num % 1 === 0

  if (!data) {
    return [0, 0]
  }

  const chartTypes = [
    'looker_area',
    'looker_bar',
    'looker_column',
    'looker_line',
    'looker_scatter',
    'table',
  ]

  const range = [0, data.length]

  if (
    !config ||
    !chartTypes.includes(config.type) ||
    !config.limit_displayed_rows ||
    !config.limit_displayed_rows_values ||
    !isInteger(config.limit_displayed_rows_values.num_rows)
  ) {
    return range
  }

  const visibleRange = []
  const limitValues = config.limit_displayed_rows_values
  const numRows = parseInt(limitValues.num_rows, 10)
  switch (limitValues.show_hide) {
    case 'show':
      if (limitValues.first_last === 'first') {
        visibleRange[0] = 0
        visibleRange[1] = numRows
      } else {
        visibleRange[0] = range[1] - numRows
        visibleRange[1] = range[1]
      }
      break
    case 'hide':
      if (limitValues.first_last === 'first') {
        visibleRange[0] = numRows
        visibleRange[1] = range[1]
      } else {
        visibleRange[0] = 0
        visibleRange[1] = range[1] - numRows
      }
  }

  if (visibleRange[0] < 0) {
    visibleRange[0] = 0
  } else if (visibleRange[0] > range[1]) {
    visibleRange[0] = range[1]
  }
  if (visibleRange[1] < 0) {
    visibleRange[1] = 0
  } else if (visibleRange[1] > range[1]) {
    visibleRange[1] = range[1]
  }

  return visibleRange
}

export const escapeCellValue = (value: any) =>
  typeof value === 'string' ? escape(value) : value

export const getCellFromRow = (field: Field, row: Row, pivot?: Pivot): Cell => {
  if (pivot && row[field.name][pivot.key]) {
    return row[field.name][pivot.key]
  }
  return row[field.name] as Cell
}
