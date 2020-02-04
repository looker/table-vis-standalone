import React, { Component } from 'react'
import { LookerICellEditorParams } from 'web/visualizations/components/Grid/types/grid_types'
import { innerStringParser } from 'web/visualizations/components/Grid/utils/grid_utils'

export class CustomDisplayCellText extends Component<LookerICellEditorParams> {
  displayValue: string

  constructor(props: LookerICellEditorParams) {
    super(props)
    this.displayValue = innerStringParser(
      props.column,
      props.context.config,
      props.node,
      props.value
    )
  }

  isPopup() {
    return true
  }

  getValue() {
    return this.props.value
  }

  render() {
    return <textarea disabled value={this.displayValue} />
  }
}
