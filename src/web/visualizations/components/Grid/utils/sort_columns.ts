import { VisConfig } from 'web/visualizations/types/vis_config'
import {
  GenericLookerColDef,
  LookerColDef,
  LookerColGroupDef,
} from '../types/grid_types'
import { pivotColType } from './grid_constants'

const getId = (col: GenericLookerColDef): string =>
  col.colType === pivotColType
    ? getPivotId(col as LookerColGroupDef)
    : getColId(col as LookerColDef)

const getPivotId = (col: LookerColGroupDef): string =>
  (col.children[0] as LookerColDef).colId as string

// With subtotals the series name is the correct colId here otherwise colId is correct
const getColId = (col: LookerColDef): string =>
  col.seriesName || (col.colId as string)

/*
 * This takes in the formatted columns suitable for ag-grid and sorts them according
 * to a hidden config array, which is set whenever the user drags a column out of order.
 * It exits early if it finds any field that isn't present in the sorted array, because
 * that means the user has added new columns and the sort is stale.
 */
export const sortColumns = (
  formattedColumns: GenericLookerColDef[],
  config: VisConfig
): GenericLookerColDef[] => {
  if (!(config && config.column_order)) return formattedColumns

  const { column_order: orderedCols } = config

  // Early return if there's no sort list
  if (!orderedCols.length) return formattedColumns

  const sorted = formattedColumns.sort(
    (a: GenericLookerColDef, b: GenericLookerColDef) => {
      const aIdx = orderedCols.indexOf(getId(a))
      const bIdx = orderedCols.indexOf(getId(b))
      if (aIdx !== -1 && bIdx !== -1) {
        return aIdx - bIdx
      } else {
        // If either a or b is "new", its index in orderedCols will be -1.  Sort that to the end.
        if (aIdx === -1) {
          return 1
        } else {
          // bIdx === -1
          return -1
        }
      }
    }
  )
  return sorted
}
