import { rowTotalKey } from 'web/visualizations/components/Grid/utils/grid_constants'
import { fieldsFromQueryResponse } from 'web/visualizations/components/Grid/utils/grid_utils'
import { Field, QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'

export enum sortStates {
  asc = 'asc',
  desc = 'desc',
}

export enum sortReasons {
  calcLimit = 'calcLimit',
  totalLimit = 'totalLimit',
  calc = 'calc',
  offset = 'offset',
  embed = 'embed',
  subtotals = 'subtotals',
  default = '',
}

export interface Sort {
  name: string
  desc: boolean
  column?: number
}
/**
 * Return whether or not a field can be sorted and why
 * including whether it can be sorted in addition with 'shift'
 */
export const canSort = (
  field: Field | undefined,
  queryResponse: QueryResponse,
  config: VisConfig
) => {
  const limitReached = queryResponse.truncated

  if (config.transpose) return { canSort: false }
  if (field && field.name === rowTotalKey && limitReached) {
    return { canSort: false, reason: sortReasons.totalLimit }
  }
  if (field && field.is_table_calculation && limitReached) {
    return { canSort: false, reason: sortReasons.calcLimit }
  }
  if (field && field.is_table_calculation && !field.sortable) {
    return { canSort: false, reason: sortReasons.offset }
  }
  const isEmbed = window.location.pathname.indexOf('/embed/public') === 0
  if (isEmbed) return { canSort: false, reason: sortReasons.embed }
  if (queryResponse.subtotals_data && queryResponse.subtotals_data.length) {
    return { canSort: false, reason: sortReasons.subtotals }
  }

  const allFields = fieldsFromQueryResponse(queryResponse)
  const sortedFields = allFields.filter(f =>
    queryResponse.sorts.some((s: Sort) => f.name === s.name)
  )

  if (
    field &&
    !field.is_table_calculation &&
    sortedFields.some(f => f.is_table_calculation)
  ) {
    return { canSort: true, canShiftSort: false, reason: sortReasons.calc }
  }

  if (!field) return { canSort: false, reason: sortReasons.default } // For row numbers
  // All is fine, we can sort
  return { canSort: true, canShiftSort: true, reason: sortReasons.default }
}
