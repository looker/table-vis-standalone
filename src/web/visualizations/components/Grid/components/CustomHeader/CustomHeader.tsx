import { Tooltip } from '@looker/components'
import { Column, IHeaderParams } from 'ag-grid-community'
import React, { Component, RefObject } from 'react'
import { imageLoadingListener } from 'web/visualizations/components/Grid/utils/image_loading_listener'
import { RowHeightTracker } from 'web/visualizations/components/Grid/mappers/rich_cell_renderer'
import { LookerColDef } from 'web/visualizations/components/Grid/types/grid_types'
import {
  colEmptyString,
  GEAR_ICON_MULTIPLIER,
  LINE_HEIGHT_MULTIPLIER,
} from 'web/visualizations/components/Grid/utils/grid_constants'
import {
  computeFixedHeightForHeader,
  computeTextHeightForHeader,
  fieldsFromQueryResponse,
  getFieldFromColumn,
} from 'web/visualizations/components/Grid/utils/grid_utils'
import { Field, Pivot } from 'web/visualizations/types/query_response'
import { SortLabel } from '../SortLabel'

const transposeField = (column: Column) => {
  let name = column.getUserProvidedColDef().headerName
  if (name === colEmptyString) {
    name = ''
  }
  return { name } as Field
}

/**
 * This component describes up the header for each column in a given table
 */
export class CustomHeader extends Component<IHeaderParams> {
  field?: Field
  menuRef: RefObject<HTMLDivElement>
  eGuiRef: RefObject<HTMLDivElement>
  pivot?: number

  constructor(props: IHeaderParams) {
    super(props)
    const { column, context } = props
    const { queryResponse } = context
    // Get Field
    const allFields = fieldsFromQueryResponse(queryResponse)
    const fieldName = getFieldFromColumn(column)
    this.field = allFields.find(f => f.name === fieldName)
    // If transpose, we need to source fields from there too.
    if (context.config.transpose && this.field === undefined) {
      this.field = transposeField(column)
    }
    const colDef = column.getColDef() as LookerColDef

    if (queryResponse.pivots) {
      const pivotIndex = queryResponse.pivots.findIndex(
        (p: Pivot) => p.key === colDef.pivotKey
      )
      this.pivot = pivotIndex !== -1 ? pivotIndex : 0
    }

    this.menuRef = React.createRef<HTMLDivElement>()
    this.eGuiRef = React.createRef<HTMLDivElement>()
  }

  componentDidMount() {
    const { api, context } = this.props

    if (this.isFixedRowHeight()) {
      // Set the height to a single line
      api.setHeaderHeight(computeFixedHeightForHeader(context.config))
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
        api.setHeaderHeight(
          context.rowHeightTracker.getMaxHeight(
            RowHeightTracker.HEADER_ROW_INDEX,
            this.getTextHeight(),
            false
          )
        )
      }
    }
  }

  render() {
    const { config } = this.props.context
    const sortLabelClassName = `header-sort-label ag-header-cell-label ag-${config.header_text_alignment}-align`
    const headerStyle = {
      backgroundColor: config.header_background_color,
      color: config.header_font_color,
      fontSize: `${config.header_font_size}px`,
      lineHeight: `${config.header_font_size * LINE_HEIGHT_MULTIPLIER}px`,
    }
    const gearIconOffset =
      (config.header_font_size || 12) * GEAR_ICON_MULTIPLIER
    const sortStyle = {
      backgroundColor: config.header_background_color,
      paddingLeft:
        config.header_text_alignment === 'center'
          ? `${gearIconOffset}px`
          : undefined,
      width: `calc(100% - ${gearIconOffset}px)`,
    }
    const tooltipContent = this.field ? this.field.description : ''

    const labelContent = (
      <div
        className="header ag-cell-label-container"
        role="presentation"
        style={headerStyle}
      >
        <div
          className={sortLabelClassName}
          style={sortStyle}
          role="presentation"
        >
          {this.field ? (
            <SortLabel
              column={this.pivot}
              context={this.props.context}
              field={this.field}
              sorts={this.props.context.queryResponse.sorts}
            />
          ) : null}
        </div>
        <div className="header-menu">
          <div
            className="custom-header-menu-button"
            onClick={this.onMenuClicked}
            ref={this.menuRef}
            role="button"
            tabIndex={0}
          >
            <i className="fa fa-gear" />
          </div>
        </div>
      </div>
    )

    return this.field && this.field.description ? (
      <div style={{ whiteSpace: 'normal' }}>
        <Tooltip content={tooltipContent} width="400px">
          {(eventHandlers, ref) => (
            <span {...eventHandlers} ref={ref}>
              {labelContent}
            </span>
          )}
        </Tooltip>
      </div>
    ) : (
      labelContent
    )
  }

  private onMenuClicked = () => {
    if (this.menuRef && this.menuRef.current) {
      this.props.showColumnMenu(this.menuRef.current)
    }
  }

  /**
   * isPrint or truncate_text implies a fixed row height rendering
   */
  private isFixedRowHeight() {
    return this.props.context.isPrint || this.props.context.config.truncate_text
  }

  /**
   * Set the height of header from image in it's content
   */
  private resetHeightFromImage() {
    const eGui = this.eGuiRef.current
    if (eGui) {
      const image = eGui.querySelector('img')
      if (image) {
        this.props.api.setHeaderHeight(
          this.props.context.rowHeightTracker.getMaxHeight(
            RowHeightTracker.HEADER_ROW_INDEX,
            image.clientHeight + this.getTextHeight(),
            false
          )
        )
      }
    }
  }

  /**
   * Get the height required to fit text in a header
   */
  private getTextHeight() {
    return computeTextHeightForHeader(
      this.props.context.config.header_font_size,
      this.eGuiRef.current,
      this.props.column.getActualWidth()
    )
  }
}
