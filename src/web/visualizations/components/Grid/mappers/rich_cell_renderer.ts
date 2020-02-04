import { ICellRendererParams } from 'ag-grid-community'
import { ICellRendererComp } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer'
import debounce from 'lodash/debounce'
import { imageLoadingListener } from 'web/visualizations/components/Grid/utils/image_loading_listener'
import { getCellValue } from '../utils/grid_utils'

/**
 * Keeps tracks for height for all rows
 */
export class RowHeightTracker {
  static HEADER_ROW_INDEX = -1
  static HEADER_GROUP_ROW_INDEX = -2
  // Height of all rows rowNum -> rowHeight
  private rowHeights: Record<number, number> = {}

  // Average row height across all rows
  private avg: number = 0

  clear() {
    this.rowHeights = {}
    this.avg = 0
  }

  /**
   * Get the maximum known height for a given row
   *
   * @param rowIndex Which row
   * @param cellHeight The computed height of a given cell in that row
   * @param useAverage If true, return the average row height (across all rows) if that's greater than
   *                   this row's known height
   */
  getMaxHeight(rowIndex: number, cellHeight: number, useAverage: boolean) {
    const lastKnownHeight = this.rowHeights[rowIndex]

    if (lastKnownHeight && lastKnownHeight > cellHeight) {
      // Last known height of this row greater than the passed cellHeight
      return useAverage
        ? lastKnownHeight > this.avg
          ? lastKnownHeight
          : this.avg
        : lastKnownHeight
    } else {
      // Set the last known height of this row to the passed cellHeight
      this.rowHeights[rowIndex] = cellHeight

      // Use height of each row known to the tracker
      // and compute the average row height across all known rows
      const allHeights = Object.entries(this.rowHeights).map(v => v[1])
      this.avg = Math.ceil(
        allHeights.reduce((a, b) => a + b) / allHeights.length
      )

      return useAverage
        ? cellHeight > this.avg
          ? cellHeight
          : this.avg
        : cellHeight
    }
  }
}

/**
 * Custom ag-grid cell renderer. This achieves the following:
 * 1. Adds support for HTML
 * 2. Adjusts row height for each row, including support for dynamically sized content like images
 * 3. Supports HTML elements which expand/change by mutating the DOM (video, <details> tag etc)
 *
 * See https://www.ag-grid.com/javascript-grid-cell-rendering-components/
 */
export class RichCellRenderer implements ICellRendererComp {
  // The root DOM element for this cell's content
  private eGui: HTMLElement

  // A MutationObserver to detect a cell changing it's DOM (for example <details> tag)
  // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  private mutationObserver: MutationObserver

  // A copy of the ag-grid cell renderer params
  private params?: ICellRendererParams
  private readonly minRowHeight: number
  private readonly rowPadding: number

  /**
   *
   * @param minRowHeight Adjust the height only if it's at least this value
   * @param rowPadding The extra offset to add to each row's height
   */
  constructor(minRowHeight: number = 20, rowPadding: number = 10) {
    this.rowPadding = rowPadding
    this.minRowHeight = minRowHeight
    this.eGui = document.createElement('div')
    this.eGui.setAttribute('class', 'looker-renderer')

    // We want rows to change their height, if some interactive element
    // in a cell, causes that cell to change it's size
    this.mutationObserver = new MutationObserver(() =>
      this.computeAndSetRowHeight()
    )
  }

  init(params: ICellRendererParams) {
    this.params = params

    // Create a debounced version of ag-grid api onRowHeightChanged
    if (!this.params!.context.onRowHeightChangedDebounced) {
      this.params!.context.onRowHeightChangedDebounced = debounce(
        () => this.params!.api.onRowHeightChanged(),
        100
      )
    }

    // Initialize the cell's root DOM element
    this.eGui.innerHTML = getCellValue(params) as string

    // Adjust the row height based on contents of this cell
    this.updateRowHeight()

    // Register the mutation observer
    this.mutationObserver.observe(this.eGui, {
      childList: true,
      subtree: true,
      attributes: true,
    })
  }

  getGui() {
    return this.eGui
  }

  destroy() {
    // clean up mutationObserver
    this.mutationObserver.disconnect()
  }

  refresh(params: ICellRendererParams) {
    this.eGui.innerHTML = getCellValue(params) as string
    this.updateRowHeight()
    return true
  }

  /**
   * Update row height by looking at what elements this cell has. Includes special handling for cells with images.
   */
  updateRowHeight() {
    const images: HTMLImageElement[] = Array.from(
      this.eGui.querySelectorAll('img')
    )
    if (images && images.length) {
      // if there is are images in this cell.
      //
      // Set the row height to the higher of a) tallest row cell b) average row height
      // We do this to allocate some placeholder vertical space until images are loaded
      // and it helps with a smoother scroll
      this.computeAndSetRowHeight(true)

      // After images are loaded, reset the row height
      imageLoadingListener(images, () => this.computeAndSetRowHeight())
    } else {
      // for non image cells, go ahead and set the row height
      this.computeAndSetRowHeight()
    }
  }

  /**
   * Sets the row height to the tallest cell in row
   *
   * @param useAverage if true, set the row height to the higher of:
   *      a) tallest row cell
   *      b) average row height across all rows
   */
  computeAndSetRowHeight(useAverage: boolean = false) {
    // See notes on commented method getTallestCellHeight below
    // const cellHeight = this.rowPadding + this.getTallestCellHeight();

    // take the height of this cell
    const cellHeight = this.rowPadding + this.getGui().offsetHeight

    // determine the row height by taking the tallest known cell height
    const rowHeight = this.params!.context.rowHeightTracker.getMaxHeight(
      this.params!.node.rowIndex,
      cellHeight,
      useAverage
    )

    // Set the rowHeight, if it is greater thant he current row height
    if (
      rowHeight >= this.minRowHeight &&
      rowHeight > this.params!.node.rowHeight
    ) {
      // The log information below is useful to debug problems with height adjustments
      // console.log('. ' + this.params!.node.rowIndex + ": " + rowHeight  + " > " + this.params!.node.rowHeight)
      this.params!.node.setRowHeight(rowHeight)
      this.params!.context.onRowHeightChangedDebounced()
    }
  }

  // This commented code block below represents an alternate approach to computing the tallest cell height.
  // As dynamic row sizing gets usage and we troubleshoot performance etc this has been left here for the reference
  // of an engineer working on it
  //
  // /**
  //  * For the current row, returns the height of it's tallest cell
  //  */
  // private getTallestCellHeight() {
  //   // Get all the cell renderers for this row
  //   const cellRenderers: ICellRendererComp[] = this.params!.api.getCellRendererInstances({
  //     rowNodes: [this.params!.node]
  //   });
  //
  //   // get cell with maximum height
  //   return cellRenderers.reduce(
  //     (maxHeight, renderer) =>
  //       renderer.getGui().offsetHeight > maxHeight
  //         ? renderer.getGui().offsetHeight
  //         : maxHeight,
  //     0
  //   );
  // }
}
