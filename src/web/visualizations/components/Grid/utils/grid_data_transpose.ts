import {
  AllFields,
  AllProcessedFields,
  Cell,
  Field,
  Pivot,
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
import { colEmptyString, rowTotalKey } from './grid_constants'
import { wrapDataInCell } from './grid_data_utils'
import { convertValueFormat } from './grid_utils'
import { getFieldLabel } from './header_utils'

// TODO change to an import after Lexp is loaded properly
require('script-loader!assets/javascripts/async/lexp-lang')

/**
 * Consumes a result set and produces individual rows for the grid to consume.
 * Formats the columns based on the queryResponse into an object ag-grid can handle.
 */
export const gridDataTranspose = (
  queryResponse: QueryResponse,
  config: VisConfig,
  columns: LookerColDef[] | LookerColGroupDef[],
  queryStats: QueryStats
): Row[] => {
  const { pivots = [] } = queryResponse.fields
  if (pivots.length) {
    return [
      ...buildPivotedRows(queryResponse, config, queryStats, columns),
      ...buildSupermeasureRows(queryResponse, config, queryStats, columns),
    ]
  } else {
    return buildRows(queryResponse, config, queryStats, columns)
  }
}

const buildRow = (
  queryResponse: QueryResponse,
  measure: Field,
  columns: LookerColDef[] | LookerColGroupDef[],
  config: VisConfig,
  queryStats: QueryStats
): Row => {
  const { data, fields } = queryResponse
  const { dimension_like: dimensions } = fields
  const measureName = measure.name
  const cellVisualization = getCellVis(config, measureName)
  const formattedDatum: GenericObject = {}
  const dimensionName = dimensions[0].name
  const hasSubtotals = !!queryResponse.subtotal_sets
  const valueFormat = config.series_value_format || {}
  formattedDatum.dataMap = {}
  columns.forEach((col: LookerColDef) => {
    if (col.field === 'measure') {
      const label = getFieldLabel(
        measure,
        config,
        (fields as unknown) as AllProcessedFields
      )
      formattedDatum[col.field] = wrapDataInCell(label)
      formattedDatum.dataMap[col.field!] = measure.name
    } else {
      const colLookup = col.field === colEmptyString ? '' : col.field
      const datum = data.find(d => {
        // We need to use the converted value format for column lookup
        const convertedVal = convertValueFormat(
          d[dimensionName],
          dimensions[0],
          valueFormat,
          queryResponse.number_format
        )
        return convertedVal === colLookup
      })
      if (datum !== undefined) {
        formattedDatum[col.field!] = datum[measureName]
        formattedDatum.dataMap[col.field!] = {
          cell: datum[measureName] as Cell,
          field: measure,
          queryStats: queryStats[measureName],
          cellVisualization,
          hasSubtotals,
          valueFormat,
        }
      }
    }
  })
  return formattedDatum
}

// Builds transposed rows, with no pivots
const buildRows = (
  queryResponse: QueryResponse,
  config: VisConfig,
  queryStats: QueryStats,
  columns: LookerColDef[] | LookerColGroupDef[]
): Row[] => {
  const { measure_like: measures } = queryResponse.fields
  const rows: Row[] = []

  measures.forEach((measure: Field) => {
    const formattedDatum = buildRow(
      queryResponse,
      measure,
      columns,
      config,
      queryStats
    )
    rows.push(formattedDatum)
  })

  return rows
}

/*
 * Builds a row in a transpose with pivots scenario.
 *
 * The main difference is that extra work must be done to apply values in the
 * proper columns, as pivots are now included as columns.
 */
const buildPivotedRow = (
  datum: Row,
  measure: Field,
  pivotValue: string,
  dimensions: Field[],
  pivots: Field[],
  config: VisConfig,
  queryStats: QueryStats,
  fields: object,
  hasSubtotals: boolean,
  numberFormat?: string
): Row => {
  const row = {} as GenericObject
  row.dataMap = {}
  // Transpose is limited to 1 dimension
  const dimensionName = dimensions[0].name
  const valueFormat = config.series_value_format || {}

  // Apply pivot values to the column that they belong to
  pivots.forEach(pivot => {
    const displayValue = displayPivotValue(pivots, pivot.name, pivotValue)
    row[`measure_${pivot.name}`] = wrapDataInCell(displayValue)
  })
  const measureName = measure.name
  const cellVisualization = getCellVis(config, measureName)
  const label = getFieldLabel(measure, config, (fields as unknown) as AllFields)
  row.measure = wrapDataInCell(label)
  const display = {
    cell: datum[measureName][pivotValue],
    field: measure,
    queryStats: queryStats[measureName],
    cellVisualization,
    hasSubtotals,
    valueFormat,
  }
  const cell = datum[dimensionName]
  const colField = convertValueFormat(
    cell,
    dimensions[0],
    valueFormat,
    numberFormat
  )
  row.dataMap[colField] = display
  row.dataMap.measure = measureName
  row.dataMap.pivotKey = pivotValue
  row[colField] = datum[measureName][pivotValue]

  return row as Row
}

const buildSupermeasureRows = (
  queryResponse: QueryResponse,
  config: VisConfig,
  queryStats: QueryStats,
  columns: LookerColDef[] | LookerColGroupDef[]
): Row[] => {
  const { supermeasure_like: supermeasures } = queryResponse.fields
  const supermeasureRows: Row[] = []

  supermeasures.forEach(supermeasure => {
    const formattedDatum = buildRow(
      queryResponse,
      supermeasure,
      columns,
      config,
      queryStats
    )
    supermeasureRows.push(formattedDatum)
  })

  return supermeasureRows
}

// Build transposed rows when pivots are involved.
const buildPivotedRows = (
  queryResponse: QueryResponse,
  config: VisConfig,
  queryStats: QueryStats,
  _columns: LookerColDef[] | LookerColGroupDef[]
): Row[] => {
  const { data, fields } = queryResponse
  const { pivots, dimension_like: dimensions, measure_like: measures } = fields
  const pivotedRows: Cell[] = []
  const hasSubtotals = !!queryResponse.subtotal_sets
  // Instead of looping over columns, loop over the measures, then find the appropriate column.
  const allPivotValues = queryResponse.pivots!.map((p: Pivot) => p.key)
  // We're essentially creating a 'vertical' loop, where the first iteration over data creates
  // an array containing all the rows as simple objects, and each subsequent iteration fills in
  // those existing objects.
  data.forEach((datum: Row) => {
    let count = 0 // Count is the index of the current transpose row, not the index of the data
    allPivotValues.forEach((pivotValue: string) => {
      measures.forEach((measure: Field) => {
        if (!(isTotal(pivotValue) && measure.is_table_calculation)) {
          pivotedRows[count] = pivotedRows[count] || ({} as Cell)
          const row = buildPivotedRow(
            datum,
            measure,
            pivotValue,
            dimensions,
            pivots,
            config,
            queryStats,
            fields,
            hasSubtotals,
            queryResponse.number_format
          )
          pivotedRows[count] = {
            ...pivotedRows[count],
            ...row,
            dataMap: { ...pivotedRows[count].dataMap, ...row.dataMap },
          }
          count += 1
        }
      })
    })
  })
  return pivotedRows
}

// Returns the proper value for a row based on the pivot column we're looking at.
const displayPivotValue = (
  pivots: Field[],
  pivotName: string,
  pivotValue: string
): string => {
  const pivotNames = pivots.map((p: Field) => p.name)
  const keys = pivotValue.split('|FIELD|')

  // Properly display totals instead of the $$$ nomenclature
  if (keys.length === 1 && isTotal(keys[0])) {
    return 'Total'
  }
  return keys[pivotNames.indexOf(pivotName)]
}

const isTotal = (val: string): boolean => val === rowTotalKey
