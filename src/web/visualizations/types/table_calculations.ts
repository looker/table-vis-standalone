import { Field, QueryResponse } from './query_response'

declare global {
  interface Window {
    Lexp: {
      parse: (expression: string, fieldsForLexp: LexpFields) => LexpParseResult
    }
  }
}

export interface LexpFields {
  aliases: { [key: string]: string }
  dimensions: Field[]
  hasRowTotals: boolean
  hasTotals: boolean
  measures: Field[]
  table_calculations: Field[]
}

export interface LexpParseResult {
  canPivot: boolean
  errors: string[]
  isMeasure: boolean
  sortable: boolean
  transform: (result: QueryResponse) => any
  type: string
}

export interface SortObject {
  column?: number
  desc: boolean
  name: string
}

export interface TableCalculationParsed {
  can_pivot?: boolean
  expression: string
  is_disabled: boolean
  label: string
  table_calculation: string
  value_format?: string
  value_format_name?: string
}
