export interface ReferenceLineConfig {
  color?: string
  label?: string
  label_position?: LabelPosition | string
  line_value?: string | number
  margin_bottom?: string | number
  margin_top?: string | number
  margin_value?: string | number
  range_start?: string | number
  range_end?: string | number
  reference_type: ReferenceLineType | string
  value_format?: string
}

export enum LabelPosition {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export enum ReferenceLineType {
  Line = 'line',
  Range = 'range',
  Margins = 'margins',
}
