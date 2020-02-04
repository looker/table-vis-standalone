import { CellEvent, ColDef, ColGroupDef, RowNode } from 'ag-grid-community'
import { Field, QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'

export interface GridContext {
  config: VisConfig
  queryResponse: QueryResponse
  overlay: boolean
  done: () => void
  triggerCb: triggerFn
  isPrint?: boolean
}

export interface TransposeField extends Field {
  transpose_index?: number
}

export interface GenericObject {
  [key: string]: any
}

export interface LookerColDef extends ColDef {
  cellClass?: string | string[]
  cellStyle?: object
  children?: any[]
  colType?: string // measure, row, pivot, etc
  measure?: string
  pivotKey?: string
  isFinalDimension?: boolean
  seriesName?: string
  tranposeIndex?: number
}

export interface LookerICellEditorParams {
  column: LookerColDef
  context: GridContext
  node: RowNode
  value: string
}

export interface LookerCellEvent extends CellEvent {
  colDef: LookerColDef
}

export interface LookerColGroupDef extends ColGroupDef {
  cellClass?: string | string[]
  cellStyle?: object
  colType: string // measure, row, pivot, etc
  field?: string
  rowGroup: boolean
  autoHeight?: boolean
  displayName?: string
}

export type triggerFn = (type: string, opts: any[]) => void

export type GenericLookerColDef = LookerColDef | LookerColGroupDef

/*
 * A value format is represented as an object (selection), a string (custom),
 * or `undefined` (default).
 */
export interface ValueFormatByField {
  [fieldName: string]: ValueFormat | string | undefined
}

interface ValueFormat {
  format_string: string
}
