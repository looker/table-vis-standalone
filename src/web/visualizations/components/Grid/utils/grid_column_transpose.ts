import {
  AllFields,
  AllProcessedFields,
  Field,
  QueryResponse,
  Row,
} from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import {
  LookerColDef,
  LookerColGroupDef,
  TransposeField,
  ValueFormatByField,
} from '../types/grid_types'
import {
  colsFromMeasures,
  colsFromRowNumbers,
  getPinStatusByColId,
} from './grid_column'
import { hideRow } from './grid_data'
import { agGridValueGetter } from './grid_data_utils'
import { convertValueFormat } from './grid_utils'
import { getFieldLabel } from './header_utils'
import { sortColumns } from './sort_columns'

export const gridColumnTranspose = (
  queryResponse: QueryResponse,
  config: VisConfig
) => {
  /*
   * Formats the columns based on the queryResponse into an object ag-grid can handle.
   */
  const fields = (queryResponse.fields as unknown) as AllProcessedFields // TODO this is a hack due to DX-397
  const { data } = queryResponse

  const {
    dimension_like: dimensions = [],
    measure_like: measures = [],
    pivots = [],
  } = fields
  const formattedColumns = []

  // Row numbers first
  if (config.show_row_numbers) {
    formattedColumns.push(colsFromRowNumbers())
  }

  // We need to leave 'room' in the form of a column for however many layers of pivots are becoming rows,
  // ie: no pivots = 1, 1 pivot = 2, etc.
  const dimensionName = dimensions[0].name
  formattedColumns.push(
    ...colsFromTranspose(
      dimensionName,
      measures,
      pivots,
      config,
      fields as AllFields
    )
  )

  // Then we go off-script for the transposed columns.
  const valueFormat = config.series_value_format || {}
  const hideRows = hideRow(config, data.length)
  const fakeMeasures = buildMeasures(
    data.slice(hideRows.start, hideRows.end),
    dimensions[0],
    valueFormat,
    queryResponse.number_format
  )
  // Override header name in this case
  const headerNames = fakeMeasures.map(m => ({ headerName: m.label || m.name }))
  formattedColumns.push(...colsFromMeasures(fakeMeasures, config, headerNames))

  return sortColumns(
    formattedColumns as LookerColDef[] | LookerColGroupDef[],
    config
  )
}

// Creates "fake" measures from dimension values, to apply as transposed columns.
const buildMeasures = (
  data: Row[],
  dimension: Field,
  valueFormat: ValueFormatByField,
  numberFormat?: string
): Field[] =>
  data.map((d, index) => {
    const cell = d[dimension.name]
    const colField = convertValueFormat(
      cell,
      dimension,
      valueFormat,
      numberFormat
    )
    return {
      is_table_calculation: false,
      name: colField,
      label: cell.html ? cell.html : undefined,
      transpose_index: index,
    } as TransposeField
  })

const colsFromTranspose = (
  dimensionName: string,
  measures: Field[],
  pivots: Field[],
  config: VisConfig,
  allFields: AllFields
) => {
  const cols = pivots.map((pivot, index) => ({
    colId: `measure_${pivot.name}`,
    colType: 'tp_measure',
    field: `measure_${pivot.name}`,
    headerName: getFieldLabel(pivot, config, allFields),
    rowGroup: false,
    pinned: getPinStatusByColId(`measure_${pivot.name}`, config),
    colNumber: index,
    valueGetter: agGridValueGetter,
  }))
  if (measures.length) {
    cols.push({
      colId: 'measure',
      colType: 'tp_measure',
      field: 'measure',
      headerName: pivotHeaderName(dimensionName, config),
      rowGroup: false,
      pinned: getPinStatusByColId('measure', config),
      colNumber: cols.length,
      valueGetter: agGridValueGetter,
    })
  }
  return cols
}

// The dimension name will become the pivot header name, only if supplied by the user.
const pivotHeaderName = (name: string, config: VisConfig): string => {
  if (config.series_labels && config.series_labels[name]) {
    return config.series_labels[name]
  }
  return ''
}
