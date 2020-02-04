import uniq from 'lodash/uniq'
import { AllFields, Field } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'

const getFieldLabel = (
  field: Field,
  options: VisConfig,
  allFields: AllFields
) => {
  if (options.series_labels && options.series_labels[field.name]) {
    return options.series_labels[field.name]
  } else if (optionsAllowShowViewNames(options)) {
    return field.label || field.name
  } else {
    return gridShortFieldLabel(field, options, allFields)
  }
}

// The dashboard contains some logic around this I've replicated here, but `unscopedLabels` does not exist
const optionsAllowShowViewNames = (options: VisConfig) =>
  (options.useUnscopedLabels === false && !options.useUnscopedLabels) ||
  options.show_view_names

const gridShortFieldLabel = (
  field: Field,
  options: VisConfig,
  allFields: AllFields
) => {
  // Some nice logic for improving short field names
  if (!optionsAllowShowViewNames(options)) {
    if (allFields && field.view_label && field.measure) {
      // Always just show the view label for count measures
      if (field.label_short === 'Count') {
        return field.view_label
      }

      if (allFields.measures.length > 1) {
        // If every measure would have the same label
        const uniqueShortNames = uniq(
          allFields.measures.map(f => f.label_short)
        )
        if (uniqueShortNames.length === 1 && uniqueShortNames[0]) {
          return field.view_label
        } else if (uniqueShortNames.length !== allFields.measures.length) {
          const sameLabels = allFields.measures.filter(
            f => f.label_short === field.label_short
          )
          if (sameLabels.length > 1) {
            return field.label
          }
        }
      }
    }
  }

  return field.label_short || field.label || field.name
}

export { getFieldLabel, gridShortFieldLabel, optionsAllowShowViewNames }
