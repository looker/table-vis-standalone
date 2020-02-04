import { ColDef } from 'ag-grid-community'
import {
  Cell,
  Field,
  QueryResponse,
  Row,
} from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import {
  GenericObject,
  LookerColDef,
  LookerColGroupDef,
} from '../types/grid_types'
import {
  getCellVis,
  QueryStats,
} from './CellVisualizations/cell_visualizations'
import { getFieldFromColDef } from './grid_utils'

// TODO change to an import after Lexp is loaded properly
// require('script-loader!assets/javascripts/async/lexp-lang') // TODO

const getValueFormat = (allFields: Field[], config: VisConfig) => {
  const valueFormat = { ...config.series_value_format }
  allFields.forEach(field => {
    if (field.value_format && !valueFormat[field.name]) {
      valueFormat[field.name] = { format_string: field.value_format }
    }
  })
  return valueFormat ? valueFormat : {}
}

/**
 * Consumes a result set and produces individual rows for the grid to consume
 */
export const gridData = (
  queryResponse: QueryResponse,
  config: VisConfig,
  columns: LookerColDef[] | LookerColGroupDef[],
  allFields: Field[],
  queryStats: QueryStats,
  isTotal = false
) => {
  const hasSubtotals = !!queryResponse.subtotal_sets
  const hideRows = hideRow(config, queryResponse.data.length)

  // Use totals data if specified, otherwise use row data
  const data = isTotal
    ? [queryResponse.totals_data]
    : queryResponse.data.slice(
        hideRows.start || 0,
        hideRows.end || queryResponse.data.length
      )
  const rows = data.map((datum: Row, index: number) => {
    const formattedDatum: GenericObject = {}
    formattedDatum.dataMap = {}
    formattedDatum.row = index + hideRows.frontHidden
    const valueFormat = getValueFormat(allFields, config)
    columns.forEach((col: LookerColDef) => {
      const { colType } = col
      if (colType === 'row') {
        return
      }

      if (colType === 'pivot') {
        const { children } = col as LookerColGroupDef
        children.forEach((child: ColDef) => {
          const { field, measure, pivotKey } = child as LookerColDef
          if (field && measure && pivotKey) {
            const normalizedFieldName = getFieldFromColDef(
              child as LookerColDef
            )
            const fullField = allFields.find(
              f => f.name === normalizedFieldName
            )
            if (!fullField) return
            const cellVisualization = getCellVis(config, measure, isTotal)
            formattedDatum[field] = datum[measure][pivotKey]
            formattedDatum.dataMap[field] = {
              cell: datum[measure][pivotKey],
              field: fullField,
              queryStats: queryStats[measure],
              cellVisualization,
              hasSubtotals,
              valueFormat,
              numberFormat: queryResponse.number_format,
              useFieldDefinition: false,
              isTotal,
            }
          }
        })
      } else {
        const { field: colField, colId } = col
        // colField/colId can be empty strings/falsey
        if (colField !== undefined && colId !== undefined) {
          const fullField = allFields.find(f => f.name === colField)
          if (!fullField) return
          const cellVisualization = getCellVis(config, colId, isTotal)
          formattedDatum[colField] = datum[colField]
          formattedDatum.dataMap[colField] = {
            cell: datum[colId] as Cell,
            field: fullField,
            queryStats: queryStats[colId],
            cellVisualization,
            hasSubtotals,
            valueFormat,
            numberFormat: queryResponse.number_format,
            useFieldDefinition: false,
            isTotal,
          }
        }
      }
    })
    return formattedDatum
  })
  return rows
}

export const hideRow = (config: VisConfig, dataLength: number) => {
  const { limit_displayed_rows, limit_displayed_rows_values } = config
  if (!limit_displayed_rows || !limit_displayed_rows_values) {
    return { start: 0, end: dataLength, frontHidden: 0 }
  }
  // determines where the slice should begin and end and how many rows it is taking out from the front
  const rows = parseInt(limit_displayed_rows_values.num_rows, 10) || 0
  // Show/First
  const set = { start: 0, end: rows, frontHidden: 0 }
  if (limit_displayed_rows_values.show_hide === 'hide') {
    // Hide/First
    set.start = rows
    set.end = dataLength
    set.frontHidden = rows
  }
  if (limit_displayed_rows_values.first_last === 'last') {
    const stopPoint = dataLength - rows
    // Hide/Last
    set.start = stopPoint >= 0 ? 0 : dataLength
    set.end = stopPoint >= 0 ? stopPoint : dataLength
    set.frontHidden = 0
    if (limit_displayed_rows_values.show_hide === 'show') {
      // Show/Last
      set.start = stopPoint >= 0 ? stopPoint : 0
      set.end = dataLength
      set.frontHidden = stopPoint >= 0 ? stopPoint : 0
    }
  }
  return set
}
