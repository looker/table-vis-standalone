import { Link, Tooltip } from '@looker/components'
import React from 'react'
import { GridContext } from 'web/visualizations/components/Grid/types/grid_types'
import { AllFields, Field } from 'web/visualizations/types/query_response'
import { urlForDocsLink } from 'web/visualizations/components/Grid/utils/docs_link_url'
import { FieldLabel } from '../FieldLabel'
import { canSort, Sort, sortReasons } from './utils/sort_utils'

interface SortLabelProps {
  column?: number
  context: GridContext
  field: Field
  sorts: Sort[]
}

interface SortIconProps {
  column?: number
  isPivot: boolean
  sort?: Sort
}

type SortReasonProps =
  | sortReasons.calcLimit
  | sortReasons.totalLimit
  | sortReasons.calc
  | sortReasons.offset
  | sortReasons.embed
  | sortReasons.subtotals
  | sortReasons.default

interface Reasons {
  [key: string]: {
    text: string
    url?: string
  }
}

const sortReason = (reason: SortReasonProps) => {
  const reasons: Reasons = {
    calcLimit: {
      text: `Cannot sort calculation`,
      url: '/r/query/calc-limit-reached',
    },
    totalLimit: {
      text: `Cannot sort total`,
      url: '/r/query/total-limit-reached',
    },
    calc: {
      text: `Calculations must be the last sorted column`,
      url: '/r/query/sort-calcs-last',
    },
    offset: {
      text: `Sorted calculations cannot depend on offset or running_total`,
      url: '/r/query/sort-calcs-dependent-on-offset-or-running-total',
    },
    embed: {
      text: `Cannot sort public embedded tables`,
      url: '/r/query/sort-public-embed-tables',
    },
    subtotals: {
      text: `Cannot sort with subtotals`,
    },
  }

  return reasons[reason]
}

/**
 * returns the sort carrot based on sort and direction
 */
const SortIcon = ({ sort, isPivot, column }: SortIconProps) => {
  const unsorted = <i className="sort lk-icon-minus unsorted" />
  if (!sort) return unsorted
  if (column !== undefined && sort.column !== column) return unsorted
  if (isPivot) {
    if (sort.desc) {
      return <i className="sort lk-icon-arrow-left-thin" />
    } else {
      return <i className="sort lk-icon-arrow-right-thin" />
    }
  } else {
    if (sort.desc) {
      return <i className="sort lk-icon-arrow-down-thin" />
    } else {
      return <i className="sort lk-icon-arrow-up-thin" />
    }
  }
}

/**
 * Sort labels are the label and icon in the header, along with a tooltip when it is not sortable
 */
export class SortLabel extends React.Component<SortLabelProps> {
  canSortField: ReturnType<typeof canSort>
  sort?: Sort
  constructor(props: SortLabelProps) {
    super(props)
    const { sorts, field, context } = props

    this.sort = sorts.find(s => s.name === field.name)

    this.canSortField = canSort(field, context.queryResponse, context.config)
  }

  icon() {
    const pivots = this.props.context.queryResponse.fields.pivots || []
    const isPivot = pivots.some(p => p.name === this.props.field.name)
    return (
      <span className="sort-icon">
        <SortIcon
          sort={this.sort}
          isPivot={isPivot}
          column={this.props.column}
        />
      </span>
    )
  }

  onToggleSortField = (event: React.MouseEvent | React.TouchEvent) => {
    /**
     * Visualizations inherit from eventEmitter, so we can emit out to the container that sorts have changed
     * and then consume the response
     */
    const opts = {
      add: !!event.shiftKey,
      column: this.props.column,
    }
    const { context, field } = this.props
    const { fields, subtotal_sets } = context.queryResponse
    const pivots = fields.pivots || []

    if (!this.canSortField.canSort) return
    if (event.shiftKey && !this.canSortField.canShiftSort) return

    // For subtotals, we want to preserve the subtotaled sorts
    // This includes the pivot sorts and any sorts in the subtotal sets
    // We also keep the sort we are sorting on if it exists
    const sortsToKeep = this.props.sorts.filter(
      s =>
        (this.sort && s.name === this.sort.name) ||
        pivots.some(p => p.name === s.name) ||
        (subtotal_sets && subtotal_sets[0].includes(s.name))
    )

    if (sortsToKeep.length && !opts.add) {
      context.triggerCb('query:sort:set', [sortsToKeep])
      opts.add = true
    }

    if (this.sort) {
      // Ensure we pass `'desc' or 'index'` if that already exists
      context.triggerCb('query:sort:toggleField', [this.sort.name, opts])

      // If the user has sorted based on a pivot, we want to clear any user-ordered columns
      // and revert back to the natural sorting order.
      const isPivotHeader = pivots.map(p => p.name).includes(this.sort.name)
      if (isPivotHeader) {
        context.triggerCb('updateConfig', [{ column_order: [] }])
      }
    } else if (field) {
      context.triggerCb('query:sort:toggleField', [field.name, opts])
    }
  }

  labelAndSort(
    eventHandlers?: React.DOMAttributes<{}>,
    ref?: React.Ref<HTMLElement>
  ) {
    const allFields = (this.props.context.queryResponse
      .fields as unknown) as AllFields
    const { config } = this.props.context
    const className = `field-label ag-header-cell-label ag-${config.header_text_alignment}-align`
    const field = this.props.field && (
      <span className={className}>
        <FieldLabel
          field={this.props.field}
          config={this.props.context.config}
          allFields={allFields}
        />
      </span>
    )

    return (
      <span
        {...eventHandlers}
        ref={ref}
        onClick={this.onToggleSortField}
        className={
          'sort-wrapper' + (!this.canSortField.canSort ? 'unsortable' : '')
        }
      >
        {field}
        {this.icon()}
      </span>
    )
  }

  render() {
    const reason = sortReason(this.canSortField.reason || sortReasons.default)

    const tooltipContent = reason ? (
      <>
        {`${reason.text} `}
        {reason.url && (
          <Link target="_blank" href={urlForDocsLink(reason.url)}>
            {`Documentation`}
          </Link>
        )}
      </>
    ) : null

    return tooltipContent ? (
      <Tooltip content={tooltipContent}>
        {(eventHandlers, ref) => this.labelAndSort(eventHandlers, ref)}
      </Tooltip>
    ) : (
      this.labelAndSort()
    )
  }
}
