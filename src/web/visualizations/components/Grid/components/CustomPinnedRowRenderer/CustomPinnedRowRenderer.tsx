import { Tooltip } from '@looker/components'
import { Column, ColumnApi } from 'ag-grid-community'
import React from 'react'
import {
  GridContext,
  LookerColDef,
} from 'web/visualizations/components/Grid/types/grid_types'
import { rowColId } from 'web/visualizations/components/Grid/utils/grid_constants'
import { cellStyleGlobal } from '../../utils/grid_utils'

interface PinnedRowProps {
  colDef: LookerColDef
  value: string
  column: Column
  columnApi: ColumnApi
  context: GridContext
}

/**
 * Display the totals row which is pinned to the bottom of the grid
 */
const Internal: React.FC<PinnedRowProps> = ({
  colDef,
  value,
  column,
  columnApi,
}) => {
  const valueRender = (
    <span
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    />
  )

  if (colDef.colId === rowColId) {
    return <TotalTooltip />
  }

  if (
    column.getLeft() === 0 &&
    (column.isPinnedLeft() || !columnApi.isPinningLeft())
  ) {
    return (
      <>
        <TotalTooltip />
        {valueRender}
      </>
    )
  }

  return valueRender
}

const TotalTooltip: React.FC = () => (
  <Tooltip content={`Totals include data for all possible rows'`}>
    {(eventHandlers, ref) => (
      <span
        style={{ position: 'relative' }}
        className="pull-left ag-totals"
        {...eventHandlers}
        ref={ref}
      >
        {`'Totals'`}
      </span>
    )}
  </Tooltip>
)

export const CustomPinnedRowRenderer = React.forwardRef(
  (props: PinnedRowProps, ref) => (
    <span
      className="ag-pinned-bottom-totals"
      style={cellStyleGlobal(props.context.config, true)}
      ref={ref as React.RefObject<HTMLElement>}
    >
      <Internal {...props} />
    </span>
  )
)
