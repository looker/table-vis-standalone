import { ColorApplication } from 'web/color/models/color_types'

export interface VisConfig {
  [key: string]: VisConfigValue
  color_application?: ColorApplication
  column_type?: ColumnTypes
}

export interface ColumnTypes {
  [key: string]: ColumnType
}

export interface ColumnType {
  is_measure: boolean
  is_pivot: boolean
}

export type VisConfigValue = any
