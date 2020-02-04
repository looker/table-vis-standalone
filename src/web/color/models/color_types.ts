import { ContinuousPalette as ContinuousPaletteType } from 'web/core_api/types/continuous_palette'
import { DiscretePalette as DiscretePaletteType } from 'web/core_api/types/discrete_palette'

export interface ColorApplication {
  collection_id: string
  palette_id?: string
  custom?: DiscretePaletteType | ContinuousPaletteType
  options?: ColorApplicationOptions
}

export enum PaletteType {
  Continuous = 'continuous',
  Discrete = 'discrete',
}

export interface ColorApplicationOptions {
  constraints?: DataConstraints
  mirror: boolean
  reverse: boolean
  stepped: boolean
  steps?: number
}

export interface DataConstraints {
  [key: string]: DataConstraint | undefined
  min: DataConstraint
  mid?: DataConstraint
  max: DataConstraint
}

export interface DataConstraint {
  type: DataConstraintTypes
  value?: number
}

export enum DataConstraintTypes {
  Average = 'average',
  Maximum = 'maximum',
  Median = 'median',
  Middle = 'middle',
  Minimum = 'minimum',
  Number = 'number',
  Percentile = 'percentile',
}
