export interface FunnelDataPoint {
  name: string
  percent: number
  rendered: string
  y: number
  color?: string
}

export interface FunnelDataPointNoPercent {
  name: string
  rendered: string
  y: number
}

export enum PercentType {
  percentOfMaxValue = 'total',
  percentOfPriorRow = 'prior',
}

export enum Orientation {
  automatic = 'automatic',
  dataInRows = 'rows',
  dataInColumns = 'columns',
}
