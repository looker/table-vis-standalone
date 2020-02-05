import {
  CellClickedEvent,
  ColDef,
  ColumnApi,
  GridApi,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community'
import { LicenseManager as USSEnterprise } from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import React, { Component } from 'react'
// import { isClickEventDrillable } from 'web/components/Drilling/utils'
import { VisualizationOnClickHandler } from 'web/visualizations/types/drill_types'
import { VisConfig } from 'web/visualizations/types/vis_config'
import { CustomDisplayCellText } from './components/CustomDisplayCellText/CustomDisplayCellText'
import { CustomHeader } from './components/CustomHeader/CustomHeader'
import { CustomHeaderGroup } from './components/CustomHeaderGroup/CustomHeaderGroup'
import { CustomPinnedRowRenderer } from './components/CustomPinnedRowRenderer/CustomPinnedRowRenderer'
import { GridOptionsWrapper } from './mappers/grid_mapper'
import { GenericObject, GridContext } from './types/grid_types'
// import { GRID_LICENSE_KEY } from './utils/grid_constants'
import { totalsPlacement } from './utils/grid_utils'
import { ThemeProvider } from 'styled-components'
import { theme } from '@looker/components'

const GRID_LICENSE_KEY = 'Looker_Looker_4Devs_3000Deployment_24_April_2020__MTU4NzY4MjgwMDAwMA==8f57ce06db59e1e0876c5a8db417ec12'

USSEnterprise.setLicenseKey(GRID_LICENSE_KEY)

export interface GridProps {
  options: GridContext
  trackRenderPerformance?: () => void
  firstDataRendered?: () => void
  onDataItemClick?: VisualizationOnClickHandler
}

interface TableClassMap {
  gray: string
  editable: string
  white: string
  transparent: string
  unstyled: string
  [key: string]: string
}

type TableClassKeys = keyof typeof tableClassMap
type TableClassValues = typeof tableClassMap[TableClassKeys]

const tableClassMap: TableClassMap = {
  gray: 'ag-theme-gray',
  editable: 'ag-theme-classic',
  white: 'ag-theme-white',
  transparent: 'ag-theme-transparent',
  unstyled: 'ag-theme-unstyled',
  default: 'ag-theme-gray',
}

export const optsShouldUpdateCols = [
  'show_row_totals',
  'query_fields',
  'show_row_numbers',
]

export const optsShouldUpdateRows = ['series_cell_visualizations']

export const optsShouldUpdateAll = [
  'header_background_color',
  'header_font_color',
  'header_font_size',
  'header_text_alignment',
  'limit_displayed_rows',
  'limit_displayed_rows_values',
  'show_totals',
  'series_collapsed',
  'series_labels',
  'series_value_format',
  'show_view_names',
  'size_to_fit',
  'transpose',
  'table_theme',
  'truncate_text',
]

export const optsShouldRedrawRows = [
  'series_text_format',
  'rows_font_size',
  'color_application',
  'conditional_formatting',
  'conditional_formatting_ignored_fields',
  'conditional_formatting_include_nulls',
  'conditional_formatting_include_totals',
  'enable_conditional_formatting',
]

export const optsShouldSizeRowsHeight = ['rows_font_size']

export const optsShouldResizingHeight = ['header_font_size', 'truncate_text']

export const optsShouldUpdateNone = [
  'column_types',
  'show_sql_query_menu_options',
]
export const optsShouldAutosize = ['series_column_widths']

/*
 * Collapse all subtotal groups according to config settings
 */
const autoCollapseAggRows = (api: GridApi, config: VisConfig) => {
  if (config.series_collapsed && Object.keys(config.series_collapsed).length) {
    api.forEachNode((node: RowNode) => {
      if (node.field) {
        node.expanded =
          config.series_collapsed && !config.series_collapsed[node.field]
      }
    })
    api.onGroupExpandedOrCollapsed()
  }
}

const frameworkComponents = {
  agColumnHeader: CustomHeader,
  agColumnGroupHeader: CustomHeaderGroup,
  totalsDataRowRenderer: CustomPinnedRowRenderer,
  displayCellText: CustomDisplayCellText,
}

export default class Grid extends Component<GridProps> {
  private api?: GridApi
  private columnApi?: ColumnApi
  private gridOptionsWrapper: GridOptionsWrapper

  constructor(props: GridProps) {
    super(props)
    this.gridOptionsWrapper = new GridOptionsWrapper(props.options)
  }

  /*
   * Autosizes columns based on content, if they are smaller then the viewport, it forces them to fit
   */
  autosizeColumns = (event?: any) => {
    if (!this.api || !this.columnApi) return
    // onGridSizeChanged can trigger when the grid is hidden and has 0 height
    if (event && (event.clientHeight === 0 || event.clientWidth === 0)) {
      return
    }

    const { isPrint } = this.props.options
    const config = this.gridOptionsWrapper.config()
    const { series_column_widths, size_to_fit, truncate_text } = config

    // First ensure all widths from config changes are set
    const allCols = this.gridOptionsWrapper.getColDefs()
    if (allCols.length && series_column_widths) {
      this.gridOptionsWrapper.getColDefs().forEach((col: ColDef) => {
        if (col.colId !== undefined && series_column_widths[col.colId]) {
          this.columnApi!.setColumnWidth(
            col.colId,
            series_column_widths[col.colId]
          )
        }
      })
    }

    // Size all columns to fit, return if that option is set
    // If we're printing, size to fit, set print layout, and return
    if (isPrint || size_to_fit) {
      this.api.sizeColumnsToFit()
    }

    // Otherwise, layout the columns in a sane manner by size
    else {
      setTimeout(() => {
        // Don't relayout columns with explicity width
        const colsToUpdate = this.columnApi!.getAllColumns().filter(
          col => !col.getColDef().width
        )
        this.columnApi!.autoSizeColumns(colsToUpdate)
      })
    }

    if (!truncate_text) {
      this.api.redrawRows()
    }

    totalsPlacement(this.api)
  }

  /**
   * Listen for changes from the props and update the chart
   * Vis Config Changes primarily modify these
   */
  componentDidUpdate(prevProps: GridProps) {
    // Return if we're changing the key and doing a full re-render
    const config = this.gridOptionsWrapper.config()
    const queryResponse = this.gridOptionsWrapper.queryResponse()
    if (this.api && config) {
      if (prevProps.options.queryResponse.id === queryResponse.id) {
        if (queryResponse.fields && this.columnApi) {
          // resets row height if truncate name is toggled and adjusted
          // or if it is untoggled to return it to the standard height
          if (
            this.shouldUpdateFromOpts(
              optsShouldResizingHeight,
              prevProps.options.config,
              config
            )
          ) {
            if (this.api) {
              this.api.resetRowHeights()
            }
          }

          this.api.refreshHeader()
          totalsPlacement(this.api)
          this.autosizeColumns()
        }
      }
      autoCollapseAggRows(this.api, this.gridOptionsWrapper.config())
    }
  }

  /**
   * Ensure all callbacks have access to the apis
   * Autosize and listen for resize events
   */
  onGridReady = (params: GridReadyEvent) => {
    if (!params.api) return
    this.api = params.api
    this.columnApi = params.columnApi
    this.autosizeColumns()
    if (this.api) {
      autoCollapseAggRows(this.api, this.gridOptionsWrapper.config())
    }
    if (this.columnApi) {
      window.addEventListener('resize', () => setTimeout(this.autosizeColumns))
      totalsPlacement(this.api)
      this.props.options.done()
      if (this.props.trackRenderPerformance) {
        this.props.trackRenderPerformance()
      }
      if (this.props.firstDataRendered) {
        this.props.firstDataRendered()
      }
    }
  }

  shouldUpdateFromOpts(
    keys: string[],
    previousObj: GenericObject,
    nextObj: GenericObject
  ) {
    // Stringify because the key could be an object
    return keys.some(
      key => JSON.stringify(nextObj[key]) !== JSON.stringify(previousObj[key])
    )
  }

  shouldComponentUpdate(nextProps: GridProps) {
    const { options } = nextProps
    const { config, queryResponse } = options

    if (
      config.transpose &&
      this.shouldUpdateFromOpts(
        ['sorts'],
        this.gridOptionsWrapper.queryResponse(),
        queryResponse
      )
    ) {
      // column_order is set via user dragging/repositioning columns around
      // In case of transpose, reset it if user has applied a sort
      // Expected behavior is that:
      //  - Transpose should listen to the sort in the underlying data table
      //  - User could over ride by dragging around columns in the vis
      this.props.options.triggerCb('updateConfig', [{ column_order: {} }])
      config.column_order = {}
    }

    const prevConfig = this.gridOptionsWrapper.config()
    const oldQueryResponse = this.gridOptionsWrapper.queryResponse()

    // Update gridMapper with new config and queryResponse
    this.gridOptionsWrapper.updateContext(
      nextProps.options.queryResponse,
      nextProps.options.config
    )

    // Should fully rerender
    const qrHasChanged = this.shouldUpdateFromOpts(
      ['qr'],
      { qr: oldQueryResponse },
      { qr: queryResponse }
    )

    const shouldUpdateAll: boolean =
      qrHasChanged ||
      this.shouldUpdateFromOpts(optsShouldUpdateAll, prevConfig, config)
    // Sadly, even when we are 'updating all' it appears that internal components
    // can still end up with a stale context (sort headers for one) so
    // here we update those manually
    if (this.api && shouldUpdateAll) {
      this.api.refreshClientSideRowModel('aggregate')
      this.api.refreshHeader()
    }
    if (this.api && !shouldUpdateAll) {
      // Conditionally update columns
      this.shouldUpdateFromOpts(optsShouldUpdateCols, prevConfig, config) &&
        this.api.setColumnDefs(this.gridOptionsWrapper.getColDefs())
      // Conditionally update rows by setting row data
      this.shouldUpdateFromOpts(optsShouldUpdateRows, prevConfig, config) &&
        this.api.setRowData(this.gridOptionsWrapper.getRowData())
      // Conditionally update rows by redrawing rows
      this.shouldUpdateFromOpts(optsShouldRedrawRows, prevConfig, config) &&
        this.api.redrawRows()
      this.shouldUpdateFromOpts(optsShouldSizeRowsHeight, prevConfig, config) &&
        this.api.resetRowHeights()
      // Just autosize if changing col widths
      // we want to ensure the tall cells rerender if truncate text is off
      this.shouldUpdateFromOpts(optsShouldAutosize, prevConfig, config) &&
        this.autosizeColumns()
    }
    // Ensure we call done rendering on additional renders
    this.props.options.done()
    return shouldUpdateAll
  }

  onCellClick = (eventData: CellClickedEvent) => {
    const { event, colDef, data, node } = eventData
    if (!event || !this.props.onDataItemClick) return
    if (!colDef.colId) return
    const allData = data ? data : node.aggData
    if (!allData) return
    let cellData = allData[colDef.colId]
    if (!cellData && colDef.showRowGroup) {
      cellData = allData[colDef.showRowGroup.toString()]
    }
    if (cellData && cellData.links) {
      this.props.onDataItemClick({
        event,
        links: cellData.links,
      })
    }
  }

  render() {
    // TODO when table themes are implemented
    const config = this.gridOptionsWrapper.config()
    const tableTheme: TableClassValues =
      (config && config.table_theme) || 'default'
    const tableClass = tableClassMap[tableTheme]
    const gridOptions = this.gridOptionsWrapper.buildGridOptions()
    return (
      // AgGridReact appears to no be able to accept a className

      <ThemeProvider theme={theme}>
        <div className={'ag-grid-vis ' + tableClass}>
          <AgGridReact
            reactNext={true}
            {...gridOptions}
            onGridReady={this.onGridReady}
            onGridSizeChanged={this.autosizeColumns}
            onCellClicked={this.onCellClick}
            onColumnEverythingChanged={this.autosizeColumns}
            frameworkComponents={frameworkComponents}
          />
        </div>
      </ThemeProvider>
    )
  }
}
