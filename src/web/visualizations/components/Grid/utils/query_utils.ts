import clone from 'lodash/clone'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import flatten from 'lodash/flatten'
import fromPairs from 'lodash/fromPairs'
import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import map from 'lodash/map'
import omitBy from 'lodash/omitBy'
import pick from 'lodash/pick'
import reject from 'lodash/reject'
import uniqBy from 'lodash/uniqBy'
import values from 'lodash/values'
import { QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'

export interface SortObject {
  column?: number
  desc: boolean
  name: string
}

export const jsonCopy = (value: any): any => {
  if (isString(value) || isNumber(value) || isArray(value) || isObject(value)) {
    return JSON.parse(JSON.stringify(value))
  } else {
    throw new Error('Can only copy strings, numbers, arrays and objects!')
  }
}

export const preprocessQueryResponseKey = (
  id: number,
  options: VisConfig = {}
) =>
  `${id}:${JSON.stringify(
    pick(options, ['hidden_points_if_no', 'hidden_fields'])
  )}`

export const preprocessQueryResponse = (
  queryResponse: QueryResponse,
  options: VisConfig = {},
  sorts?: SortObject[]
) => {
  let out: QueryResponse | null = null
  if (queryResponse && queryResponse.data) {
    if (queryResponse.data.length > 5000) {
      return {
        data: [],
        fields: {},
        length: 5001,
        pivots: [],
        number_format: queryResponse.number_format,
      }
    }
    out = jsonCopy(queryResponse)
  }

  let validNoFilters: any[] = []
  if (out && out.fields) {
    if (options.hidden_points_if_no && options.hidden_points_if_no.length > 0) {
      validNoFilters = flatten(values(out.fields))
        .filter(
          f =>
            f.type === 'yesno' &&
            options.hidden_points_if_no.indexOf(f.name) !== -1
        )
        .map(f => f.name)

      out.data = out.data.filter((d: any) => {
        for (const fieldName of validNoFilters) {
          // Regular fields
          if (d[fieldName] && d[fieldName].value !== undefined) {
            if (d[fieldName].value === 'No') {
              return false
            }
            // Measure-like fields that are pivoted out
            // In this case, the row will be hidden if ANY of the values are No
          } else if (d[fieldName] && !d[fieldName].value) {
            for (const pivotName in d[fieldName]) {
              if (d[fieldName][pivotName].value === 'No') {
                return false
              }
            }
          }
        }
        return true
      })
    }

    const hiddenFields = new Set<string>(
      (options.hidden_fields || []).concat(validNoFilters || [])
    )
    if (hiddenFields && hiddenFields.size > 0) {
      for (const k in out.fields) {
        out.fields[k] = out.fields[k].filter(
          field => !hiddenFields.has(field.name)
        )
      }

      if (out.subtotal_sets) {
        adjustForHiddenSubtotals(out, hiddenFields)
      }
    }

    const calcs = out.fields.table_calculations || []
    const dimensions = out.fields.dimensions || []
    const measures = out.fields.measures || []

    if (out.pivots) {
      out.fields.measure_like = measures.concat(
        calcs.filter(c => c.measure && c.can_pivot)
      )
      out.fields.supermeasure_like = calcs.filter(
        c => c.measure && !c.can_pivot
      )
    } else {
      out.fields.measure_like = measures.concat(calcs.filter(c => c.measure))
    }

    out.fields.dimension_like = dimensions.concat(calcs.filter(c => !c.measure))
  }

  if (out) {
    out.sorts = sorts || []
    out.id = preprocessQueryResponseKey(out.id, options)
  }

  return out
}

const adjustForHiddenSubtotals = (
  out: QueryResponse,
  hiddenFields: Set<string>
) => {
  const dimensionNames = map(out.fields.dimensions, 'name')
  const subtotalSetIndex = findIndex(out.subtotal_sets, sSet =>
    isEqual(sSet, dimensionNames)
  )
  if (subtotalSetIndex !== -1) {
    // If we've hidden a dimension that points to a new subtotal grouping, make that grouping the
    // new `data` and kick all larger subtotal groupings out of the query response.
    // This is somewhat experimental and may change after feedback on the initial beta launch of subtotals
    const subtotalSet = out.subtotal_sets[subtotalSetIndex]
    out.data = out.subtotals_data[String(subtotalSet.length)]
    out.subtotal_sets = filter(
      out.subtotal_sets,
      (set: string[]) => set.length < subtotalSet.length
    )
    out.subtotals_data = omitBy(
      out.subtotals_data,
      (sd: any, groupSizeKey: string) =>
        Number(groupSizeKey) >= subtotalSet.length
    )
  } else {
    // If someone removed a subtotaled field, and we don't have even subtotaled groupings left over,
    // due to the way hidden_fields are implemented we have to yank the references to the removed subtotal
    // fields out of all the subtotal data
    const newSubtotalSets: string[][] = []
    const updatedSubtotalSetSizes: { [key: string]: string } = {}
    out.subtotal_sets.forEach((set: string[]) => {
      const withoutHidden = reject(set, el => hiddenFields.has(el))
      if (withoutHidden.length > 0) {
        newSubtotalSets.push(withoutHidden)
      }
      updatedSubtotalSetSizes[set.length] = String(withoutHidden.length)
    })

    out.subtotal_sets = uniqBy(newSubtotalSets, e => e.length)
    out.subtotals_data = fromPairs(
      map(out.subtotals_data, (val: any[], key) => {
        const stringKey = String(key)
        const updatedSize = updatedSubtotalSetSizes[key]
        if (
          updatedSize !== stringKey &&
          updatedSubtotalSetSizes[updatedSize] === updatedSize
        ) {
          // If there is a different, more granular subtotal set that has not had any fields hidden from it,
          // ignore this set and use that one instead
          return ['0', []]
        }
        let newRows = val
        if (updatedSize !== stringKey) {
          // If the grouping has changed, adjust the $$$__grouping__$$$ key per-row to reflect the new grouping
          newRows = newRows.map((row: { [key: string]: any }) => {
            const newRow = clone(row)
            newRow.$$$__grouping__$$$ = reject(row.$$$__grouping__$$$, f =>
              hiddenFields.has(f as string)
            )
            return newRow
          })
        }
        return [updatedSize, newRows]
      })
    )
    delete out.subtotals_data['0']
  }
}
