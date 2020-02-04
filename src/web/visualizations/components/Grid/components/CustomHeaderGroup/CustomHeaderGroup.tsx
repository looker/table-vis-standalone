import { Text } from '@looker/components'
import { ColumnGroup, IHeaderGroupParams } from 'ag-grid-community'
import React, { RefObject } from 'react'
import { imageLoadingListener } from 'web/visualizations/components/Grid/utils/image_loading_listener'
import { RowHeightTracker } from 'web/visualizations/components/Grid/mappers/rich_cell_renderer'
import {
  GridContext,
  LookerColDef,
} from 'web/visualizations/components/Grid/types/grid_types'
import {
  LINE_HEIGHT_MULTIPLIER,
  rowTotalKey,
} from 'web/visualizations/components/Grid/utils/grid_constants'
import {
  computeFixedHeightForHeader,
  computeTextHeightForHeader,
} from 'web/visualizations/components/Grid/utils/grid_utils'
import { Cell, Field, Pivot } from 'web/visualizations/types/query_response'
import { PublicCellUtils } from 'web/visualizations/components/Grid/utils/public_cell_utils'
import { SortLabel } from '../SortLabel'

const getPivotHTML = (
  displayName: string,
  columnGroup: ColumnGroup,
  context: GridContext
) => {
  // Leave empty pivots for columns without a label
  // This allows us to style the rows
  let pivotEls: JSX.Element[] = Array(
    context.queryResponse.fields.pivots.length
  ).fill(<Text fontSize="xsmall" />)
  const children = columnGroup.getChildren()
  const childColDef = children[0].getDefinition() as LookerColDef
  const fontSize = `${context.config.header_font_size}px`
  const whiteSpace =
    context.config.isPrint || context.config.truncate_text ? 'nowrap' : 'normal'
  const color = context.config.header_font_color
  const { pivots } = context.queryResponse

  // If we are a row total, then we know what our header will be
  if (displayName === rowTotalKey) {
    pivotEls = [
      <span
        style={{ fontSize }}
        color={color}
        key={displayName}
        className="pivot view-and-field-label"
      >
        Total
      </span>,
    ]
  } else if (pivots && childColDef && childColDef.colType === 'pivotChild') {
    // We are a measure group, add pivot value labels
    const pivotForCol = pivots.find(
      (pivot: Pivot) => pivot.key.toLowerCase() === displayName.toLowerCase()
    )
    if (!pivotForCol) return pivotEls
    const pivotLabels = Object.values(pivotForCol.metadata)
    pivotEls = pivotLabels.map(label => (
      <span
        style={{ fontSize, whiteSpace }}
        color={color}
        key={pivotForCol.key}
        dangerouslySetInnerHTML={{
          // Support html (from liquid in the model), rendered (from value formats) and vanilla values
          __html: PublicCellUtils.htmlForCell(label as Cell, ''),
        }}
      />
    ))
  } else if (childColDef.isFinalDimension) {
    // We are in a pivot group of the dimensions. They all share the same label.
    pivotEls = context.queryResponse.fields.pivots.map((pivot: Field) => {
      const sortLabel = (
        <SortLabel
          key={pivot.name}
          field={pivot}
          sorts={context.queryResponse.sorts}
          context={context}
        />
      )
      // const getSortLabel = (
      //   eventHandlers?: React.DOMAttributes<{}>,
      //   ref?: React.RefObject<HTMLElement>
      // ) => (
      //   <span
      //     ref={ref}
      //     {...eventHandlers}
      //   >
      //     {sortLabel}
      //   </span>
      // )

      // TODO: re-enable once https://looker.atlassian.net/browse/LENS-413 is closed
      // Currently tooltips inherit too many styles from parents to be useful
      return sortLabel
      // return pivot.description ? <Tooltip content={pivot.description}>{getSortLabel}</Tooltip> : sortLabel
    })
  }
  return pivotEls
}

/**
 * Pivot headers or "header groups" are headers that sit on top of the column headers
 * Must be a class because ag-grid passes a ref
 */
export class CustomHeaderGroup extends React.Component<IHeaderGroupParams> {
  eGuiRef: RefObject<HTMLDivElement>
  pivots: JSX.Element[]
  constructor(props: IHeaderGroupParams) {
    super(props)
    const { columnGroup, context, displayName } = props
    this.pivots = getPivotHTML(displayName, columnGroup, context)
    this.eGuiRef = React.createRef<HTMLDivElement>()
  }
  componentDidMount() {
    const { api, context } = this.props

    if (this.isFixedRowHeight()) {
      // Set the height to a single line
      api.setGroupHeaderHeight(computeFixedHeightForHeader(context.config))
    } else {
      // Check for presence of images
      const images: HTMLImageElement[] = this.eGuiRef.current
        ? Array.from(this.eGuiRef.current.querySelectorAll('img'))
        : []

      if (images && images.length) {
        // set height immediately from image
        this.resetHeightFromImage()

        // wait for image to load and then set height
        imageLoadingListener(images, () => this.resetHeightFromImage())
      } else {
        // set height from text
        api.setGroupHeaderHeight(
          context.rowHeightTracker.getMaxHeight(
            RowHeightTracker.HEADER_GROUP_ROW_INDEX,
            this.getTextHeight(),
            false
          )
        )
      }
    }
  }

  render() {
    const { config } = this.props.context
    const pivotClassName = `pivot-header ${
      this.isFixedRowHeight() ? 'pivot-truncated' : 'pivot-expanded'
    } ag-${config.header_text_alignment}-align`
    const headerStyle = {
      backgroundColor: config.header_background_color,
      color: config.header_font_color,
      fontSize: `${config.header_font_size}px`,
      lineHeight: `${config.header_font_size * LINE_HEIGHT_MULTIPLIER}px`,
    }
    return (
      <div
        ref={this.eGuiRef}
        style={{
          backgroundColor: config.header_background_color,
          whiteSpace: 'normal',
        }}
      >
        {this.pivots.map((pivot, i) => (
          <div key={i} className={pivotClassName} style={headerStyle}>
            {pivot}
          </div>
        ))}
      </div>
    )
  }

  /**
   * isPrint or truncate_text implies a fixed row height rendering
   */
  private isFixedRowHeight() {
    return this.props.context.isPrint || this.props.context.config.truncate_text
  }

  /**
   * Set the height of group header from image in it's content
   */
  private resetHeightFromImage() {
    const eGui = this.eGuiRef.current
    if (eGui) {
      const image = eGui.querySelector('img')
      if (image) {
        this.props.api.setGroupHeaderHeight(
          this.props.context.rowHeightTracker.getMaxHeight(
            RowHeightTracker.HEADER_GROUP_ROW_INDEX,
            image.clientHeight + this.getTextHeight(),
            false
          )
        )
      }
    }
  }

  /**
   * Get the height required to fit text in a group header
   */
  private getTextHeight() {
    return computeTextHeightForHeader(
      this.props.context.config.header_font_size,
      this.eGuiRef.current,
      this.props.columnGroup.getActualWidth()
    )
  }
}
