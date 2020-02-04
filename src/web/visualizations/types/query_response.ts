import { LookmlModelExploreField } from 'web/core_api/types/lookml_model_explore_field'

export interface QueryResponse {
  [key: string]: any
  data: Data
  fields: {
    [key: string]: Field[]
  }
  length?: number
  pivots?: Pivot[]
  number_format: NumberFormat
  ran_at?: string
  applied_filters?: {
    [key: string]: AppliedFilter
  } | null
}

export interface AppliedFilter {
  field: Field
  value: string
}

export type NumberFormat = '1,234.56' | '1 234,56' | '1.234,56'

export type Data = Row[]

export type Field = LookmlModelExploreField &
  DynamicFieldDefinition &
  QueryField

export interface DynamicFieldDefinition {
  name: string
  category?: string
  description?: string
  label?: string
  label_short: string
  type?: string
  value_format?: string
  value_format_name?: string
  enumerations?: Array<{ label: string; value: string }>
  is_table_calculation: boolean
  is_disabled?: boolean
  is_numeric: boolean
  is_timeframe: boolean
  measure: boolean
  can_filter: boolean
  sortable: boolean
  can_pivot: boolean
  dynamic: boolean
  align: 'left' | 'right'
  expression?: string
}

export interface AllFields {
  dimensions: Field[]
  measures: Field[]
  pivots: Field[]
  table_calculations: Field[]
}

export interface AllProcessedFields {
  [key: string]: Field[]
  dimensions: Field[]
  dimension_like: Field[]
  measures: Field[]
  measure_like: Field[]
  pivots: Field[]
  supermeasure_like: Field[]
  table_calculations: Field[]
}

interface QueryField {
  can_pivot: boolean
}

export interface Pivot {
  key: string
  is_total: boolean
  data: { [key: string]: string }
  metadata: { [key: string]: { [key: string]: string | Link[] } }
  labels: { [key: string]: string }
  sort_values?: { [key: string]: string }
}

export interface Row {
  [fieldName: string]: PivotCell | Cell
}

export interface Link {
  label: string
  type: string
  type_label: string
  url: string
  icon_url?: string
}

export interface Cell {
  [key: string]: any
  value: any
  rendered?: string
  html?: string
  links?: Link[]
}

export interface PivotCell {
  [pivotKey: string]: Cell
}

export interface DrillMenuItem extends Link {
  click?: (menuItem?: DrillMenuItem) => void
  form?: string
  form_url?: string
  icon_url?: string
}

export interface AddFilterJSON {
  rendered: string
  field: string
  add: string
}

export interface FilterData {
  add: string
  field: string
  rendered: string
}
