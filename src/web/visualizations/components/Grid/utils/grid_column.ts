import { ColDef } from 'ag-grid-community'
import {
  AllProcessedFields,
  Field,
  Pivot,
  QueryResponse,
} from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import {
  GenericLookerColDef,
  GenericObject,
  LookerColDef,
  LookerColGroupDef,
  TransposeField,
} from '../types/grid_types'
import { pivotColType, rowColId, rowTotalKey } from './grid_constants'
import { agGridValueGetter } from './grid_data_utils'
import { addRowExpandClass } from './grid_utils'
import { sortColumns } from './sort_columns'

const DEFAULT_COLUMN_WIDTH = 100

const LAST_COLUMN_CELL_CLASS = 'last-column'

export const getPinStatusByColId = (colId: string, config: VisConfig) => {
  if (config && config.pinned_columns) {
    return config.pinned_columns[colId]
  }
  return ''
}

/*
 * The purpose of this function is to join together any adjacent pivots that share
 * the same header value. For ease of sorting they are kept separate up until this point.
 */
const mergePivotedColumns = (formattedColumns: GenericLookerColDef[]) =>
  formattedColumns.reduce(
    (
      cols: GenericLookerColDef[],
      col: GenericLookerColDef
    ): GenericLookerColDef[] => {
      if (col.colType !== pivotColType) {
        cols.push(col)
      } else {
        const lastCol = cols[cols.length - 1]
        if (
          lastCol &&
          lastCol.colType === pivotColType &&
          lastCol.field === col.field
        ) {
          // Pivot header match, only append the child
          lastCol!.children!.push(col!.children![0])
        } else {
          // No match, add the whole pivot
          cols.push(col)
        }
      }
      return cols
    },
    []
  )

const duplicateCol = (oldCol: LookerColGroupDef): LookerColGroupDef => ({
  ...oldCol,
})

const getWidthForField = (field: Field, config: VisConfig) => {
  if (!config.series_column_widths) return null
  return config.series_column_widths[field.name]
}

/**
 * This generates an individual column for each field or pivotted field in a query
 * These align with the cells in a row of data
 * It optionally adds row numbers and totals columns
 * The logic is currently quite rigid as to the order they are added,
 * but they are sorted afterwards if user dragging is present.
 */
export const gridColumn = (queryResponse: QueryResponse, config: VisConfig) => {
  /*
   * Formats the columns based on the queryResponse into an object ag-grid can handle.
   */
  const fields = (queryResponse.fields as unknown) as AllProcessedFields // TODO this is a hack due to DX-397
  const {
    dimensions = [],
    measures = [],
    pivots = [],
    supermeasure_like = [],
    table_calculations = [],
  } = fields
  const formattedColumns = []

  // Row numbers first assuming there are no subtotals and it's enabled
  if (config.show_row_numbers && !queryResponse.subtotals_data) {
    formattedColumns.push(colsFromRowNumbers())
  }

  // Subtotal group columns
  if (queryResponse.subtotals_data) {
    formattedColumns.push(
      ...colsFromSubtotalGroups(
        dimensions,
        config,
        queryResponse.subtotals_data
      )
    )
  }

  // GetDimensionsLikeCalcs
  const dimensionLikeTableCalcs = table_calculations.filter(
    calc => !calc.measure
  )

  // Then Dimensions
  formattedColumns.push(
    ...colsFromDimensions(
      dimensions,
      pivots,
      config,
      queryResponse.subtotals_data,
      !!dimensionLikeTableCalcs.length
    )
  )

  // Then Dimension like table calcs
  formattedColumns.push(
    ...colsFromTableCalculations(
      dimensionLikeTableCalcs,
      config,
      !!dimensions.length
    )
  )

  // Measures and table calcs are only shown in the context of pivots when present.
  if (queryResponse.pivots && queryResponse.pivots.length) {
    formattedColumns.push(
      ...colsFromPivots(
        queryResponse.fields.measure_like,
        queryResponse.pivots!,
        config
      )
    )
  } else {
    // When there are no pivots, show measures and table calcs in own column.
    if (measures.length) {
      formattedColumns.push(...colsFromMeasures(measures, config))
    }
    if (table_calculations.length) {
      const measureCalcs = table_calculations.filter(calc => calc.measure) || []
      formattedColumns.push(...colsFromTableCalculations(measureCalcs, config))
    }
  }
  // Supermeasures are added to the end because they don't pivot
  if (supermeasure_like.length) {
    formattedColumns.push(
      ...colsFromTableCalculations(supermeasure_like, config)
    )
  }
  const sortedFormattedColumns = sortColumns(
    formattedColumns as GenericLookerColDef[],
    config
  )
  // Once we get the sort results back, loop through and merge any adjacent pivots
  const mergedColumns = mergePivotedColumns(
    sortedFormattedColumns as GenericLookerColDef[]
  )

  /*
   * Add a class to the right-most column.
   * NOTE: This logic assumes the column objects are new and immutable, therefore we don't have to worry about removing the class from the previous right-most column.
   */
  if (mergedColumns.length) {
    let lastColumn = mergedColumns[
      mergedColumns.length - 1
    ] as GenericLookerColDef
    if (lastColumn.colType === 'pivot' && lastColumn.children) {
      lastColumn = lastColumn.children[lastColumn.children.length - 1]
    }
    if (!lastColumn.cellClass) {
      lastColumn.cellClass = [LAST_COLUMN_CELL_CLASS]
    } else if (typeof lastColumn.cellClass === 'string') {
      lastColumn.cellClass += ` ${LAST_COLUMN_CELL_CLASS}`
    } else if (Array.isArray(lastColumn.cellClass)) {
      lastColumn.cellClass.push(LAST_COLUMN_CELL_CLASS)
    }
  }
  return mergedColumns
}

export const colsFromMeasures = (
  measures: TransposeField[],
  config: VisConfig,
  options: object[] = []
) => {
  interface Overrides {
    [cellRenderer: string]: string
  }
  const cellClass = addRowExpandClass('measure', config.truncate_text)
  return measures.map((measure, index) => {
    const { label, name } = measure
    const tranposeIndex =
      measure.transpose_index !== undefined
        ? measure.transpose_index
        : undefined
    const width = getWidthForField(measure, config)
    const overrides = options[index] || ({} as Overrides)
    return {
      autoHeight: !config.truncate_text,
      cellClass,
      cellEditor: 'displayCellText',
      colId: name,
      colType: 'measure',
      editable: true,
      field: name,
      headerClass: cellClass,
      headerName: label,
      measure: name,
      pinned: getPinStatusByColId(name, config),
      rowGroup: false,
      seriesName: name,
      suppressSizeToFit: !!width,
      tranposeIndex,
      valueGetter: agGridValueGetter,
      width,
      ...overrides,
    }
  })
}

/*
 * For every pivot there will be a column for all measures and table calcs.
 */
const colsFromPivots = (
  measures: Field[],
  pivots: Pivot[],
  config: VisConfig
) => {
  const pivotColumns = pivots.map((pivot: Pivot) => {
    const { key } = pivot
    const isRowTotal = pivot.key === rowTotalKey
    const outerMeasure: LookerColGroupDef = {
      autoHeight: !config.truncate_text,
      children: [],
      colType: pivotColType,
      field: key,
      headerClass: isRowTotal ? 'ag-row-total' : '',
      headerName: key,
      rowGroup: false,
    }
    // Table calculations do not total
    // to filter them out for row total columns
    if (isRowTotal) {
      measures = measures.filter(m => !m.is_table_calculation)
    }

    outerMeasure.children = measures.map((measure: Field) => {
      const { label, name } = measure
      let cellClass: string = measure.category || ''
      if (measure.is_table_calculation) {
        cellClass = 'table-calc'
      }
      cellClass += isRowTotal ? ' ag-row-total' : ''
      cellClass = addRowExpandClass(cellClass, config.truncate_text)
      const colId = `${key}_${name}`
      const width = getWidthForField(measure, config)
      return {
        autoHeight: !config.truncate_text,
        cellClass,
        cellEditor: 'displayCellText',
        colId,
        colType: 'pivotChild',
        columnGroupShow: 'open',
        editable: true,
        field: colId,
        headerClass: cellClass,
        headerName: label,
        hide:
          isRowTotal &&
          config.show_row_totals !== undefined &&
          !config.show_row_totals,
        measure: name,
        pinned: getPinStatusByColId(colId, config),
        pivotKey: key,
        rowGroup: false,
        seriesName: name,
        suppressSizeToFit: !!width,
        valueGetter: agGridValueGetter,
        width: width || DEFAULT_COLUMN_WIDTH,
      }
    })
    return outerMeasure
  })

  /*
   * To make user-side sorting easier, we are returning all pivots separated out.
   * Later, whether or not sorting occurs, pivots that are next to each other are
   * merged together before rendering.
   */
  return (pivotColumns as any).flatMap((p: LookerColGroupDef) =>
    p.children.map((c: ColDef) => {
      const newP = duplicateCol(p)
      newP.children = [c]
      return newP
    })
  )
}

export const colsFromRowNumbers = () => ({
  cellClass: ['row-number', 'group-cell', 'looker-cell'],
  colId: rowColId,
  colType: 'row',
  headerClass: 'row-number-header',
  lockPosition: true,
  pinned: 'left',
  resizable: false,
  rowGroup: false,
  sortable: false,
  suppressMenu: true,
  suppressNavigable: true,
  suppressSizeToFit: true,
  valueGetter: 'node.rowIndex + 1',
  width: 45,
})

/*
 * Table Calculations can be measures, dimesions and supermeasures
 */
const colsFromTableCalculations = (
  tableCalcs: Field[],
  config: VisConfig,
  hasDimension = true
) => {
  const finalDimensionLikeCalc = tableCalcs[tableCalcs.length - 1]
  return tableCalcs.map(calc => {
    const { label, name } = calc
    const width = getWidthForField(calc, config)
    const cellClass = calc.measure
      ? 'table-calc calc-measure'
      : 'table-calc calc-dimension'
    const isFinalDimension =
      name === finalDimensionLikeCalc.name && !hasDimension
    return {
      autoHeight: !config.truncate_text,
      cellClass: addRowExpandClass(cellClass, config.truncate_text),
      cellEditor: 'displayCellText',
      colId: name,
      colType: 'table_calculation',
      editable: true,
      field: name,
      headerClass: addRowExpandClass(cellClass, config.truncate_text),
      headerName: label,
      isFinalDimension,
      pinned: getPinStatusByColId(name, config),
      rowGroup: false,
      seriesName: name,
      suppressSizeToFit: !!width,
      valueGetter: agGridValueGetter,
      width,
    }
  })
}

/*
 * Base dimensions before table calcs, pivots, measures, etc added.
 */
const colsFromDimensions = (
  dimensions: Field[],
  pivots: Field[],
  config: VisConfig,
  subtotals: GenericObject = {},
  hasDimensionLikeTableCalc?: boolean
) => {
  const hasSubtotals = !!Object.values(subtotals).some(s => !!s.length)
  // For a single pivot query, add a simple proto-column
  if (!dimensions.length && pivots.length && !hasDimensionLikeTableCalc) {
    const pivot = pivots[0]
    dimensions = ([
      {
        cellClass: pivot.category,
        colId: pivot.name,
        field: pivot.name,
        headerClass: pivot.category,
      },
    ] as unknown) as Field[]
  }
  const finalDimension = dimensions[dimensions.length - 1]
  return dimensions.map(dimension => {
    const { category, label, name } = dimension
    const isFinalDimension = name === finalDimension.name
    // If there is only 1 dimension, then we are going to display without grouping.
    const isRowGroup =
      dimensions.length > 1 && hasSubtotals && !isFinalDimension
    const width = getWidthForField(dimension, config)
    const cellClass = addRowExpandClass(category, config.truncate_text)
    return {
      autoHeight: !config.truncate_text,
      cellClass,
      cellEditor: 'displayCellText',
      colId: name,
      colType: 'default',
      field: name,
      editable: true,
      headerClass: cellClass,
      headerName: label,
      hide: isRowGroup,
      isFinalDimension,
      pinned: getPinStatusByColId(name, config),
      rowGroup: isRowGroup,
      seriesName: name,
      suppressSizeToFit: !!width,
      valueGetter: agGridValueGetter,
      width,
    } as LookerColDef
  })
}

const colsFromSubtotalGroups = (
  dimensions: Field[],
  config: VisConfig,
  subtotals: GenericObject = {}
) => {
  const hasSubtotals = !!Object.values(subtotals).some(s => !!s.length)
  const finalDimension = dimensions[dimensions.length - 1]
  return dimensions.map(dimension => {
    const { category, name, label } = dimension
    const isFinalDimension = name === finalDimension.name
    const isRowGroup =
      dimensions.length > 1 && hasSubtotals && !isFinalDimension
    const width = getWidthForField(dimension, config)
    const cellClass = addRowExpandClass(
      `${category} subtotal-cell`,
      config.truncate_text
    )
    const headerClass = addRowExpandClass(
      `${category} subtotal-header`,
      config.truncate_text
    )
    return {
      autoHeight: !config.truncate_text,
      cellClass,
      cellEditor: 'displayCellText',
      cellRenderer: 'agGroupCellRenderer',
      colId: `grouped-column-${name}`,
      colType: 'subtotal',
      editable: true,
      headerClass,
      headerName: label,
      hide: !isRowGroup,
      isFinalDimension,
      pinned: getPinStatusByColId(name, config),
      seriesName: name,
      showRowGroup: name,
      suppressSizeToFit: !!width,
      width,
    } as LookerColDef
  })
}
