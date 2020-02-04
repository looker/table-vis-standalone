import { ValueGetterParams } from 'ag-grid-community'
import isEmpty from 'lodash/isEmpty'
import { Cell, Field } from 'web/visualizations/types/query_response'
import { PublicCellUtils } from 'web/visualizations/components/Grid/utils/public_cell_utils'
import { ValueFormatByField } from '../types/grid_types'
import { CellVisualizationBar } from './CellVisualizations/cell_bar'
import {
  getCellVisualization,
  QueryStat,
} from './CellVisualizations/cell_visualizations'
import { convertValueFormat } from './grid_utils'

/**
 * Creates HTML for display in ag-cell
 * Called on row render for each cell.
 * This is preferable to calling it on grid render for each cell.
 * Previous versions of this grid would call it for each cell in the whole grid and create a map of all the html
 * As a valuegetter it allows us to call this function at a later time.
 * This function is a very heavy call when you consider that it takes ~1ms/cell for thousands of cells
 * https://www.ag-grid.com/javascript-grid-value-getters/
 */
export const agGridValueGetter = (params: ValueGetterParams) => {
  // Subtotals are weird, maybe it gets it's own renderer
  const colId = params.colDef.colId
  if (
    colId === undefined || // colId can be an empty string
    !params.data ||
    !params.data.dataMap ||
    !params.data.dataMap[colId]
  ) {
    return null
  }
  const {
    cell,
    field,
    queryStats,
    cellVisualization,
    hasSubtotals,
    valueFormat,
    numberFormat,
    useFieldDefinition,
    isTotal,
  } = params.data.dataMap[colId]
  if (isEmpty(cell)) {
    return null
  }
  return displayFromCell(
    cell,
    field,
    queryStats,
    cellVisualization,
    hasSubtotals,
    valueFormat,
    numberFormat,
    useFieldDefinition,
    isTotal
  )
}

export const displayFromCell = (
  cell: Cell,
  field: Field,
  queryStats: QueryStat,
  cellVisualization: CellVisualizationBar,
  hasSubtotals: boolean,
  valueFormat: ValueFormatByField,
  numberFormat?: string,
  useFieldDefinition = false,
  isTotal = false
) => {
  if (isEmpty(cell)) {
    return null
  }

  const rendered = convertValueFormat(cell, field, valueFormat, numberFormat)
  // Use new converted value
  const convertedCell = { ...cell, rendered }

  // builds the total html with the link instead of using the default html
  // this allows us to use the series value formatting on the total cells
  if (isTotal && convertedCell.links) {
    convertedCell.html = PublicCellUtils.totalCellToHtml(
      rendered,
      convertedCell.links[0].url
    )
  }

  // TODO: Add way to distinguish between the DATA section and visualizations
  // Returns a 'Filter on ____' drill option. Should be used for the 'DATA' section in explore
  // return wrapDataInCell(
  //   PublicCellUtils.htmlForCell(cell as Cell, '', field),
  // )

  // Assigns `Filter on ____` drill option if specified.
  let html
  if (useFieldDefinition && !isEmpty(field)) {
    // Does assign `Filter on ____` drill option. Should be used in data section
    html = PublicCellUtils.htmlForCell(convertedCell, '', field)
  } else {
    // Does not assign `Filter on ____` drill option. Should be used in table visualizations
    html = PublicCellUtils.htmlForCell(convertedCell as Cell, '')
  }
  if (
    !hasSubtotals &&
    (cellVisualization.is_active ||
      (Object.keys(cellVisualization).length === 0 &&
        queryStats &&
        queryStats.isFirstMeasure))
  ) {
    html = getCellVisualization(cellVisualization, queryStats, cell, html)
  }
  return wrapDataInCell(html)
}

export const wrapDataInCell = (label: string) =>
  `<div class="looker-cell">${label}</div>`
