import {
  AddRangeSelectionParams,
  Column,
  ColumnApi,
  ColumnMovedEvent,
  ColumnPinnedEvent,
  ColumnResizedEvent,
  GetMainMenuItemsParams,
  GridApi,
  GridOptions,
  ICellRendererFunc,
  RowNode,
} from 'ag-grid-community'
// import { FormattingManager } from '../../../conditional_formatting/formatting_manager_generator'
// import { SeriesTextFormatCssBuilder } from '../../../conditional_formatting/series_text_format'
import { rgb } from 'd3-color'
import compact from 'lodash/compact'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import { ColorUtils } from '../utils/color_utils'
import {
  RichCellRenderer,
  RowHeightTracker,
} from 'web/visualizations/components/Grid/mappers/rich_cell_renderer'
import {
  DEFAULT_ROW_HEIGHT,
  LINE_HEIGHT_MULTIPLIER,
} from 'web/visualizations/components/Grid/utils/grid_constants'
import {
  AllProcessedFields,
  Cell,
  Field,
  QueryResponse,
} from '../../../types/query_response'
import { VisConfig } from '../../../types/vis_config'
import {
  GenericObject,
  GridContext,
  LookerCellEvent,
  LookerColDef,
  LookerColGroupDef,
  LookerICellEditorParams,
  triggerFn,
} from '../types/grid_types'
import { getQueryStats } from '../utils/CellVisualizations/cell_visualizations'
import { gridColumn } from '../utils/grid_column'
import { gridColumnTranspose } from '../utils/grid_column_transpose'
import { gridData, hideRow } from '../utils/grid_data'
import { gridDataTranspose } from '../utils/grid_data_transpose'
import { agGridValueGetter, displayFromCell } from '../utils/grid_data_utils'
import {
  cellStyleGlobal,
  fieldsFromQueryResponse,
  getCellValue,
  getFieldFromColumn,
  getFullFieldFromColumn,
  innerStringParser,
} from '../utils/grid_utils'

const Lexp = (window as any).Lexp

interface PinnedColMap {
  [key: string]: 'left' | 'right' | ''
}

export const simpleCellRenderer: ICellRendererFunc = getCellValue

const getRowDefs = (
  queryResponse: QueryResponse,
  config: VisConfig,
  columnDefs: LookerColDef[] | LookerColGroupDef[],
  allFields: Field[]
) => {
  if (queryResponse.data) {
    // Manipulates Looker's data response into a format suitable for ag-grid.
    const queryStats = getQueryStats(queryResponse, config)
    if (config.transpose) {
      return gridDataTranspose(queryResponse, config, columnDefs, queryStats)
    } else {
      return gridData(queryResponse, config, columnDefs, allFields, queryStats)
    }
  }
  return []
}

// Creates an object of { key: value } out of a subtotalRow
const subtotalRowToAgRow = (
  subtotalRow: GenericObject,
  queryResponse: QueryResponse,
  allFields: Field[],
  config: VisConfig,
  level: number
) => {
  const finalSubtotal = queryResponse.fields.dimension_like
    ? queryResponse.fields.dimension_like[
        queryResponse.fields.dimension_like.length - 1
      ].name
    : ''
  const { measure_like: measures } = queryResponse.fields
  const { pivots } = queryResponse
  const valueFormat = config.series_value_format || {}
  const flatResult = Object.keys(subtotalRow).reduce(
    (memo: any, key: string) => {
      memo[key] = subtotalRow[key]
      // Check for undefined specifically because the value could be falsey
      if (memo[key] === undefined) {
        memo[key] = subtotalRow[key]
      }
      return memo
    },
    {}
  )
  // If we have pivots, operate over the flatResult again to flatten out pivots
  if (pivots && pivots.length) {
    measures.forEach(measure => {
      pivots.forEach(pivot => {
        if (!flatResult[measure.name] || !flatResult[measure.name][pivot.key]) {
          return
        }
        flatResult[`${pivot.key}_${measure.name}`] =
          flatResult[measure.name][pivot.key]
        flatResult[`${pivot.key}_${measure.name}`].fieldKey = measure.name
        flatResult[`${pivot.key}_${measure.name}`].pivotKey = pivot.key
      })
    })
  }
  const dataMap: { [key: string]: Cell } = {}
  for (const key in flatResult) {
    const fieldKey = flatResult[key].fieldKey || key
    const field = allFields.find(f => f.name === fieldKey) || ({} as Field)
    // Final subtotal dimension nulls show up as nulls on the grid.
    // To render them properly their value needs to be set to an empty string. See DX-1140 & DX-2420
    if (key === finalSubtotal && flatResult[key].value === null) {
      flatResult[key].html = '&#8203;'
    }

    dataMap[key] = flatResult[key]
    flatResult[key] = displayFromCell(
      flatResult[key],
      field,
      {},
      {},
      !!subtotalRow,
      valueFormat
    )
  }
  flatResult.dataMap = dataMap
  flatResult.row = level
  return flatResult
}

/**
 * This function grabs subtotals from the QR and supplies those rows for aggregates instead of a function that actually aggregates
 * For each dimension in a subtotaled dataset, there can be aggregated rows or "subtotals"
 * | Dimension Header | Dimension Header | Dimension Header | Measure Header        | Measure Header       |
 * | - dim value      |                  |                  | First Dim Aggregate   | First Dim Aggregate  |
 * |                  | - dim value      |                  |                       |                      |
 * |                  |                  | dim value        | sub value             | sub value            |
 * |                  |                  | dim value        | sub value             | sub value            |
 * | - dim value      |                  |                  |                       |                      |
 * |                  | - dim value      |                  | Aggregate value       | Aggregate value      |
 * |                  |                  | dim value        | sub value             | sub value            |
 * |                  |                  | dim value        | sub value             | sub value            |
 */
// Grab subtotals from QR and supply rows for aggregates instead of agg functions
// A rowNode is an ag-Grid representation of one row of data.
// For each dimension in a subtotaled dataset, there can be aggregated rows or "subtotals"
const groupRowAggNodes = (
  nodes: RowNode[],
  queryResponse: QueryResponse,
  config: VisConfig,
  allFields: Field[],
  columnDefs: LookerColDef[] | LookerColGroupDef[],
  subtotalsCounter: { [key: number]: number | undefined }
) => {
  // This method is called often by ag-grid, sometimes with no nodes.
  // Return if there are no columns in the chart
  if (isEmpty(columnDefs)) return undefined
  // Or if the queryresponse does not have subtotals
  if (!queryResponse || !queryResponse.subtotals_data) return undefined
  // Or if the table has been transposed
  if (config.transpose) return undefined
  // Or if the nodes are the very top level, such as with a pivot group
  if (isEmpty(nodes) || nodes[0].level === 0 || !nodes[0].parent) {
    return undefined
  }
  // Take the subtotals
  const subTotalArray = queryResponse.subtotals_data
  // find the current node level
  const level = nodes[0].level
  const subTotalRowSet: GenericObject = subTotalArray[level]
  // return if we are in the final dimension row which has no totals
  if (!subTotalRowSet) return undefined

  const hiddenRows = hideRow(config, queryResponse.data.length)
  // aggData is used if the group set is a made up of group sets
  const firstRowData = nodes[0].aggData ? nodes[0].aggData : nodes[0].data
  const lastRowData = nodes[nodes.length - 1].aggData
    ? nodes[nodes.length - 1].aggData
    : nodes[nodes.length - 1].data

  // If not then find the current subtotal level via the depth tracking object
  if (subtotalsCounter[level] !== undefined) {
    subtotalsCounter[level]! += 1
  } else {
    // If hiding rows we need to find where we need to start the index from in the subtotalArray
    subtotalsCounter[level] = config.limit_displayed_rows
      ? subTotalRowSet.findIndex((subtotal: GenericObject) =>
          subtotal.$$$__grouping__$$$.every(
            (columnId: string) =>
              firstRowData.dataMap &&
              subtotal[columnId].value === firstRowData.dataMap[columnId].value
          )
        ) || 0
      : 0
    subtotalsCounter[level] =
      subtotalsCounter[level]! < 0 ? 0 : subtotalsCounter[level]
  }
  const childIndex = subtotalsCounter[level]
  if (childIndex === undefined) return undefined
  // We have reached the end of the row, reset for next round of renders
  if (childIndex >= subTotalRowSet.length - 1) {
    delete subtotalsCounter[level]
  }
  // A subtotalRow looks like {key: { value: foo, rendered: foo }} or if pivoted
  // {key: {pivot_val: { value: foo, rendered: foo }, pivot_val: { value: foo, rendered: foo }}}
  const subtotalRow = subTotalRowSet[childIndex]

  // return an empty row with dataMap so the next level of subtotals can know what
  // shouldnt be shown and determine if it needs to be rendered or not as well
  if (
    config.limit_displayed_rows &&
    (!firstRowData || !lastRowData || firstRowData.row === undefined)
  ) {
    return { $$$__grouping__$$$: '', dataMap: subtotalRow }
  }
  if (
    (config.limit_displayed_rows &&
      firstRowData &&
      hiddenRows.start !== 0 &&
      hiddenRows.start === firstRowData.row) ||
    (lastRowData &&
      hiddenRows.end !== queryResponse.data.length &&
      hiddenRows.end - 1 === lastRowData.row)
  ) {
    if (
      subtotalRow.$$$__grouping__$$$.every((columnId: string) => {
        // if the previous or past row (depending on which way hiding rows) contains the same value
        // then it means that the subtotal group is partially hidden and therefore need to hide the subtotal value
        if (
          hiddenRows.start === firstRowData.row &&
          queryResponse.data[firstRowData.row - 1]
        ) {
          return (
            subtotalRow[columnId].value ===
            queryResponse.data[firstRowData.row - 1][columnId].value
          )
        } else if (
          hiddenRows.end - 1 === lastRowData.row &&
          queryResponse.data[lastRowData.row + 1]
        ) {
          return (
            subtotalRow[columnId].value ===
            queryResponse.data[lastRowData.row + 1][columnId].value
          )
        } else {
          return false
        }
      })
    ) {
      return { $$$__grouping__$$$: '', dataMap: subtotalRow }
    }
  }

  // If we cannot run subtotals on all fields, certain rows may end up being an empty array
  if (!subtotalRow) return
  // Then create an object of {key: value} out of a subtotalRow. This is the format ag-grid expects
  return subtotalRowToAgRow(
    subtotalRow,
    queryResponse,
    allFields,
    config,
    level
  )
}

const expandGrid = (api: GridApi, config: VisConfig) => {
  const { truncate_text: truncateText } = config
  if (truncateText !== undefined && !truncateText) {
    api.resetRowHeights()
  }
}

const customPinnedMenu = (column: Column, columnApi: ColumnApi) => {
  let name = ''
  let action
  if (column.isPinned()) {
    name = `Unfreeze`
    action = () => columnApi.setColumnPinned(column.getColId(), '')
  } else {
    name = `Freeze`
    action = () => columnApi.setColumnPinned(column.getColId(), 'left')
  }
  return {
    name,
    action,
  }
}

const copyColumnMenu = (api: GridApi, column: Column) => {
  const name = `Copy Values`
  const rangeSelection: AddRangeSelectionParams = {
    rowStart: 0,
    rowEnd: api.getDisplayedRowCount(),
    columnStart: column,
    columnEnd: column,
    floatingStart: '',
    floatingEnd: '',
  }
  const action = () => {
    api.clearRangeSelection()
    api.addRangeSelection(rangeSelection)
    api.copySelectedRangeToClipboard(true)
    api.clearRangeSelection()
  }
  return {
    name,
    action,
  }
}

const resetWidthsFromColumnName = (
  context: GridContext,
  columnName?: string
) => {
  // If there's no column name provided we remove all widths
  const widths = columnName ? { ...context.config.series_column_widths } : {}
  if (columnName) {
    delete widths[columnName]
  }

  context.triggerCb('updateConfig', [
    {
      series_column_widths: widths,
    },
  ])
}

const resetAllWidths = (context: GridContext, columnApi: ColumnApi) => {
  const name = `Reset All Column Widths`
  const action = () => {
    resetWidthsFromColumnName(context)
    columnApi.autoSizeColumns(columnApi.getAllColumns())
  }
  return {
    name,
    action,
  }
}

const convertToPivot = (column: Column, context: GridContext) => {
  const { config, triggerCb } = context
  const seriesName = (column.getColDef() as LookerColDef).seriesName
  if (!seriesName) return undefined
  const currentType =
    (config.column_types && config.column_types[seriesName]) || {}
  const isPivot = !!currentType.is_pivot
  const name = isPivot
    ? `Unpivot Column`
    : `Pivot Column`
  const action = () => {
    triggerCb('updateConfig', [
      {
        column_types: {
          ...config.column_types,
          [seriesName]: {
            is_pivot: !isPivot,
          },
        },
      },
    ])
  }
  return {
    name,
    action,
  }
}

const convertToMeasure = (column: Column, context: GridContext) => {
  const { config, triggerCb } = context
  const seriesName = (column.getColDef() as LookerColDef).seriesName
  if (!seriesName) return undefined
  const currentType =
    (config.column_types && config.column_types[seriesName]) || {}
  const isMeasure = !!currentType.is_measure
  const name = isMeasure
    ? `Convert to Dimension`
    : `Convert to Measure`
  const action = () => {
    triggerCb('updateConfig', [
      {
        column_types: {
          ...config.column_types,
          [seriesName]: {
            is_measure: !isMeasure,
          },
        },
      },
    ])
  }
  return {
    name,
    action,
  }
}

const autoSizeAll = (
  api: GridApi,
  columnApi: ColumnApi,
  context: GridContext
) => {
  const name = `Autosize All Columns`
  const action = () => {
    const listener = onAutoSizeAllColumns.bind({ context })
    // We only want to listen for "autosizeColumns" for the duration of this call because
    // it is called internally a lot
    api.addEventListener('columnResized', listener)
    columnApi.autoSizeColumns(columnApi.getAllColumns())
    api.removeEventListener('columnResized', listener)
    expandGrid(api, context.config)
  }
  return {
    name,
    action,
  }
}

const getMainMenuItems = ({
  api,
  columnApi,
  column,
  context,
}: GetMainMenuItemsParams) => {
  if (!api || !columnApi || !column || !context) return []
  const pinMenu = customPinnedMenu(column, columnApi)
  const resetWidths = resetAllWidths(context, columnApi)
  const mainItems = [
    pinMenu,
    copyColumnMenu(api, column),
    'separator',
    autoSizeAll(api, columnApi, context),
    resetWidths,
  ]
  const sqlQueryItems = [
    'separator',
    convertToMeasure(column, context),
    convertToPivot(column, context),
  ]
  return context.config.show_sql_query_menu_options
    ? mainItems.concat(compact(sqlQueryItems))
    : mainItems
}

const getWidthsFromColumns = (columns: Column[]) =>
  columns.reduce((obj, col) => {
    if (!col.isResizable()) return obj
    const field = getFieldFromColumn(col)
    if (!field) return obj
    obj[field] = col.getActualWidth()
    return obj
  }, {} as GenericObject)

/**
 * When the menu item for autosize all columns is clicked this updates the vis-config with the new widths
 */
const onAutoSizeAllColumns = function(
  this: GridOptions,
  params: ColumnResizedEvent
) {
  if (!params.columns) return
  // By default only save dragging options
  if (params.source !== 'autosizeColumns') return
  saveColumnResize.call(this, params)
}

/**
 * When a column is dragged this updates the vis-config with the new widths
 */
const onColumnResized = function(
  this: GridOptions,
  params: ColumnResizedEvent
) {
  if (!params.columns) return
  // By default only save dragging options
  if (params.source !== 'uiColumnDragged') return
  saveColumnResize.call(this, params)
}

/**
 * When a column is resized this updates the vis-config with the new widths
 * Types: "autosizeColumns", "uiColumnDragged", "sizeColumnsToFit"
 */
const saveColumnResize = function(
  this: GridOptions,
  params: ColumnResizedEvent
) {
  if (!params.columns) return
  const newColumnWidths = getWidthsFromColumns(params.columns)
  const existingColumnWidths = this.context.config.series_column_widths || {}

  expandGrid(params.api, this.context.config)
  this.context.triggerCb('updateConfig', [
    {
      series_column_widths: {
        ...existingColumnWidths,
        ...newColumnWidths,
      },
    },
  ])
}

const onColumnPinned = function(
  this: GridOptions,
  { columnApi }: ColumnPinnedEvent
) {
  if (columnApi) {
    const pinnedCols = columnApi.getDisplayedLeftColumns()
    const pinnedColMap = pinnedCols.reduce((obj, col) => {
      // The seriesName is tied to field.name,
      // so should use it when possible unless dealing with pivots
      const colDef = col.getColDef() as LookerColDef
      const colName =
        colDef.seriesName && !colDef.pivotKey
          ? colDef.seriesName
          : colDef.colId || ''
      obj[colName] = 'left'
      return obj
    }, {} as PinnedColMap)
    // Trigger column order update when a column is pinned.
    const orderedCols = columnApi
      .getAllDisplayedColumns()
      .map((col: Column) => getFullFieldFromColumn(col))
    this.context.triggerCb('updateConfig', [
      {
        pinned_columns: {
          ...pinnedColMap,
        },
        column_order: orderedCols,
      },
    ])
  }
}

const onColumnMoved = function(
  this: GridOptions,
  { columnApi, toIndex }: ColumnMovedEvent
) {
  // Only persist column order if toIndex has a value (which signifies that a user has explicitly moved a column)
  if (columnApi && toIndex !== undefined) {
    const orderedCols = columnApi
      .getAllDisplayedColumns()
      .map((col: Column) => getFullFieldFromColumn(col))
    this.context.triggerCb('updateConfig', [
      {
        column_order: orderedCols,
      },
    ])
  }
}

const pinnedBottomRowData = (
  qr: QueryResponse,
  config: VisConfig,
  columnDefs: LookerColDef[] | LookerColGroupDef[],
  allFields: Field[]
) => {
  // return if hide column totals
  if (
    !qr.totals_data ||
    (config.show_totals !== undefined && !config.show_totals)
  ) {
    return []
  }
  return gridData(qr, config, columnDefs, allFields, {}, true)
}

const getColDefs = (
  queryResponse: QueryResponse,
  config: VisConfig
): LookerColDef[] | LookerColGroupDef[] => {
  if (config.transpose) return gridColumnTranspose(queryResponse, config)
  return gridColumn(queryResponse, config)
}

const processCellForClipboard = (params: LookerICellEditorParams) =>
  innerStringParser(
    params.column,
    params.context.config,
    params.node,
    params.value
  )

/**
 * Returns a GridContext object that is consumed by GridOptionsWrapper to build an ag-grid
 */
export const gridMapper = (
  queryResponse: QueryResponse,
  config: VisConfig,
  triggerCb: triggerFn,
  done: () => void,
  isPrint?: boolean
) => ({
  queryResponse,
  config,
  triggerCb,
  done,
  isPrint,
  overlay: true,
})

/**
 * Used by GridOptionsWrapper below for caching computed values
 */
interface GridOptionsCache {
  columnDefs: LookerColDef[] | LookerColGroupDef[]
  allFields: Field[]
  conditionalFormatting?: any // FormattingManager // TODO
  cellStyleGlobal?: { [key: string]: string }
}

/**
 * A wrapper around ag-grid options:
 *
 * - Centralizes configuration of ag-grid and it's context
 * - Builds ag-grid configuration object from Looker visConfig and queryResponse
 */
export class GridOptionsWrapper {
  // ag-grid options object
  private readonly gridOptions: GridOptions

  // A cache to prevent unnecessary re-computation of some values
  private cache?: GridOptionsCache

  // Cached fields which should be updated each time gridOptions.context is updated
  private subtotalsCounter = {}

  constructor(gridContext: GridContext) {
    // Initialize the context
    this.gridOptions = {
      context: {
        queryResponse: gridContext.queryResponse,
        config: gridContext.config,
        isPrint: gridContext.isPrint,
        triggerCb: gridContext.triggerCb,
        done: gridContext.done,
        overlay: true,
        rowHeightTracker: new RowHeightTracker(),
      },
    }
  }

  /**
   * Convenience method to retrieve queryResponse
   */
  queryResponse = () => this.gridOptions.context.queryResponse

  /**
   * Convenience method to retrieve config
   */
  config = () => this.gridOptions.context.config

  /**
   * Update the context; this also invalidates the cache.
   */
  updateContext = (queryResponse: QueryResponse, config: VisConfig) => {
    this.gridOptions.context.queryResponse = queryResponse
    this.gridOptions.context.config = config
    // invalidate cache
    this.cache = undefined
    this.subtotalsCounter = {}
    this.gridOptions.context.rowHeightTracker.clear()
  }

  /**
   * React Grid component uses this to update the table by calling ag-grid's APIs
   */
  getColDefs = () => {
    if (!this.cache) {
      this.cache = this.buildCache()
    }

    return this.cache.columnDefs
  }

  /**
   * React Grid component uses this to update the table by calling ag-grid's APIs
   */
  getRowData = () =>
    getRowDefs(
      this.queryResponse(),
      this.config(),
      this.getColDefs(),
      this.getAllFields()
    )

  /**
   * AG Grid callback to render styles for a cell
   *
   * @see https://www.ag-grid.com/javascript-grid-cell-styles/#cell-style
   * @param params info about the cell event (see https://www.ag-grid.com/javascript-grid-cell-styles/#cell-style-cell-class-cell-class-rules-params)
   */
  cellStyleCallback = (params: LookerCellEvent) => {
    // When subTotals are on, we need to treat the sub-totaled column differently:
    //
    //   The columnId is modified by `gridColumns.colsFromSubtotalGroups` to have a prefix of
    //   `grouped-column-`, in which case, we'll get it from `params.node.field`
    //
    const { node, colDef, context } = params
    const { data } = node
    const seriesCellVisualizations =
      this.config().series_cell_visualizations || {}
    const transpose = this.config().transpose
    const columnId = transpose
      ? data.dataMap.measure
      : (colDef.seriesName as string)

    // checks if cell visualization is being used
    if (
      (!seriesCellVisualizations[columnId] &&
        context.queryResponse.fields &&
        context.queryResponse.fields.measures &&
        context.queryResponse.fields.measures[0] &&
        context.queryResponse.fields.measures[0].name === columnId) ||
      (seriesCellVisualizations[columnId] &&
        seriesCellVisualizations[columnId].is_active)
    ) {
      return {
        ...this.getCellStyleGlobal(),
      }
    } else {
      const pivotKey = transpose ? data.dataMap.pivotKey : colDef.pivotKey
      // if transpose then use transposeIndex, if rowIndex is positve
      // (not a subtotal row) use the rowIndex otherwise return undefined
      const rowId = this.config().transpose
        ? colDef.tranposeIndex
        : params.data
        ? params.data.row
        : undefined
      // if have data and seriesName use the dataMap, but use the pivotKey if needed
      // transpose stores its datum on the dataMap similarly to none pivoted datum
      const datum =
        data && colDef.seriesName
          ? pivotKey && !transpose
            ? data[`${pivotKey}_${columnId}`]
            : data[colDef.seriesName]
          : undefined

          // TODO
      // const columnStyles = new SeriesTextFormatCssBuilder(
      //   this.config().series_text_format
      // ).getStyles(columnId)

      return {
        // apply global formatting
        ...this.getCellStyleGlobal(),

        // apply series formatting
        // ...columnStyles,

        // apply lightened color to nulls
        ...this.getNullStyle(datum, columnId),

        // apply conditional formatting
        ...this.getConditionalFormattingStyles(
          node,
          context,
          datum,
          pivotKey || '',
          rowId,
          columnId
        ),
      }
    }
  }

  /**
   * React Grid component uses this in it's render to build a new ag-grid component
   */
  buildGridOptions = () => {
    Object.assign(this.gridOptions, {
      suppressAnimationFrame: true,
      components: {
        richCellRenderer: RichCellRenderer,
        simpleCellRenderer,
      },
      animateRows: false,
      autoSizePadding: 20,
      columnDefs: this.getColDefs(),
      defaultColDef: this.defaultColDef(),
      deltaColumnMode: true,
      enableFilter: false,
      enableRangeSelection: true,
      enableSorting: false,
      getMainMenuItems,
      getRowHeight: this.isFixedRowHeight()
        ? this.getFixedRowHeight
        : undefined,
      groupDefaultExpanded: -1,
      groupMultiAutoColumn: true,
      groupRowAggNodes: (nodes: RowNode[]) =>
        groupRowAggNodes(
          nodes,
          this.queryResponse(),
          this.config(),
          this.getAllFields(),
          this.getColDefs(),
          this.subtotalsCounter
        ),
      groupSuppressAutoColumn: true,
      icons: {
        groupContracted: '<i class="lk-icon-arrow-right-thin" />',
        groupExpanded: '<i class="lk-icon-arrow-down-thin" />',
      },
      onColumnMoved: debounce(onColumnMoved, 500),
      onColumnPinned,
      onColumnResized: debounce(onColumnResized, 500),
      pinnedBottomRowData: pinnedBottomRowData(
        this.queryResponse(),
        this.config(),
        this.getColDefs(),
        this.getAllFields()
      ),
      rowData: getRowDefs(
        this.queryResponse(),
        this.config(),
        this.getColDefs(),
        this.getAllFields()
      ),
      processCellForClipboard,
      rowBuffer: this.gridOptions.context.isPrint ? 5000 : 20,
      rowDeselection: true,
      rowSelection: 'multiple',
      suppressAggFuncInHeader: true,
      suppressContextMenu: true,
      suppressDragLeaveHidesColumns: true,
      suppressFieldDotNotation: true,
      suppressMaxRenderedRowRestriction: this.gridOptions.context.isPrint,
      suppressMovableColumns: false,
      suppressPropertyNamesCheck: true,
      suppressRowClickSelection: true,
      suppressClipboardPaste: true,
      suppressColumnVirtualisation: this.gridOptions.context.isPrint,
    })

    return this.gridOptions
  }

  private isFixedRowHeight() {
    return this.gridOptions.context.isPrint || this.config().truncate_text
  }

  /**
   * In some situations, we want all rows to have the same height. These include:
   * - User has chosen "Truncate Text"
   * - We're in print mode
   */
  private getFixedRowHeight = () =>
    this.config().rows_font_size
      ? this.config().rows_font_size * LINE_HEIGHT_MULTIPLIER
      : DEFAULT_ROW_HEIGHT

  private defaultColDef = () => ({
    cellRenderer: this.isFixedRowHeight()
      ? 'simpleCellRenderer'
      : 'richCellRenderer',
    menuTabs: ['generalMenuTab'], // Can be ['generalMenuTab', 'filterMenuTab','columnsMenuTab']
    minWidth: 50,
    pinnedRowCellRenderer: 'totalsDataRowRenderer',
    resizable: true,
    sortable: false,
    valueGetter: agGridValueGetter,
  })

  // Used internally to prevent re-computation
  private getAllFields = () => {
    if (!this.cache) {
      this.cache = this.buildCache()
    }

    return this.cache.allFields
  }

  private getConditionalFormattingManager = () => {
    if (!this.cache) {
      this.cache = this.buildCache()
    }

    return this.cache.conditionalFormatting
  }

  private getCellStyleGlobal = () => {
    if (!this.cache) {
      this.cache = this.buildCache()
    }

    return this.cache.cellStyleGlobal
  }

  private getConditionalFormattingStyles = (
    node: RowNode,
    context: GridContext,
    datum: Cell | undefined | null,
    pivotKey: string,
    rowId?: number,
    columnId?: string
  ) => {
    const formatManager = this.getConditionalFormattingManager()
    if (
      !this.config().enable_conditional_formatting ||
      !datum ||
      context.queryResponse.subtotals_data ||
      !columnId
    ) {
      return
    }
    if (rowId !== undefined && formatManager) {
      return formatManager.generateStyleObjectByFieldName(
        datum.value,
        columnId,
        rowId,
        pivotKey
      )
    }
    // formats the totals row
    if (node.rowPinned === 'bottom' && formatManager) {
      return formatManager.getColumnTotalStyles(columnId, pivotKey, datum.value)
    }
  }

  private getNullStyle = (datum: Cell, columnId: string | undefined) => {
    // lightens up nulls
    if (!columnId || !datum || datum.value !== null) {
      return {}
    }
    if (
      this.config().series_text_format &&
      this.config().series_text_format[columnId] &&
      this.config().series_text_format[columnId].fg_color
    ) {
      const fadeColor =
        this.config().series_text_format[columnId].bg_color || 'white'
      return {
        color: `${ColorUtils.mixColors(
          rgb(this.config().series_text_format[columnId].fg_color),
          rgb(fadeColor),
          0.5
        )}`,
      }
    }
    return { color: '#c2c2c2' } // default light gray
  }

  // Builds a local cache
  private buildCache = () => {
    // Set the ag-grid cellStyle callback on columnDefs
    const colDefs = getColDefs(this.queryResponse(), this.config())
    for (const colDef of colDefs) {
      if (colDef.children && colDef.children.length > 0) {
        for (const colDefChild of colDef.children) {
          colDefChild.cellStyle = this.cellStyleCallback
        }
      } else {
        colDef.cellStyle = this.cellStyleCallback
      }
    }

    // TODO
    // const conditionalFormatting =
    //   (this.config().conditional_formatting ||
    //   this.config().enable_conditional_formatting) && Lexp
    //     ? new FormattingManager(
    //         this.queryResponse(),
    //         this.queryResponse().fields as AllProcessedFields,
    //         this.config().hidden_fields,
    //         this.config().conditional_formatting,
    //         this.config().conditional_formatting_include_totals,
    //         this.config().conditional_formatting_include_nulls,
    //         Lexp
    //       )
    //     : undefined

    return {
      allFields: fieldsFromQueryResponse(this.queryResponse()),
      cellStyleGlobal: cellStyleGlobal(this.config()),
      columnDefs: colDefs,
      undefined
      // conditionalFormatting,
    }
  }
}
