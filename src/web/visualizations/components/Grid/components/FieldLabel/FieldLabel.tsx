import escape from 'lodash/escape'
import React from 'react'
import {
  getFieldLabel,
  optionsAllowShowViewNames,
} from 'web/visualizations/components/Grid/utils/header_utils'
import { AllFields, Field } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'

declare interface FieldLabelProps {
  field: Field
  config: VisConfig
  allFields: AllFields
}

export const FieldLabel = ({
  field,
  config = {},
  allFields,
}: FieldLabelProps) => {
  if (config.series_labels && config.series_labels[field.name]) {
    return (
      <span>
        <strong>{config.series_labels[field.name]}</strong>
      </span>
    )
  }
  if (
    optionsAllowShowViewNames(config) &&
    field.view_label &&
    field.label_short
  ) {
    // needs the space between ${escape(field.view_label)} and <strong> for display
    const escapeHtml = `<span>${escape(field.view_label)} <strong>${escape(
      field.label_short
    )}</strong></span>`
    return <span dangerouslySetInnerHTML={{ __html: escapeHtml }} />
  } else {
    return (
      <span>
        <strong
          dangerouslySetInnerHTML={{
            __html: getFieldLabel(field, config, allFields),
          }}
        />
      </span>
    )
  }
}
