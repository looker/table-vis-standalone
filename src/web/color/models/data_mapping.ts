import { max, mean, median, min, quantile } from 'd3-array'
import {
  scaleLinear,
  ScaleLinear,
  scaleQuantile,
  scaleQuantize,
} from 'd3-scale'
import { DataConstraint, DataConstraintTypes } from './color_types'
import { ContinuousPalette } from './continuous_palette'

/**
 * Utility to return an array of n linear stops between two numbers start and end, both inclusive.
 * https://gist.github.com/joates/6584908
 */
export const linearSpace = (
  start: number,
  end: number,
  numStops: number
): number[] => {
  if (numStops < 2) {
    return numStops === 1 ? [start] : []
  }

  const ret = Array(numStops)
  numStops--

  for (let i = numStops; i >= 0; i--) {
    ret[i] = (i * end + (numStops - i) * start) / numStops
  }

  return ret
}

// Utility that takes an extent and returns a data scale between 0 and 100.
export const d3Scale100 = (extent: number[]) =>
  scaleLinear()
    .domain(extent)
    .range(linearSpace(0, 100, extent.length))

// Utility to clamp a scale and return it back to allow for chaining.
export const clamp = (scale: ScaleLinear<number, number>) => {
  scale.clamp(true)
  return scale
}

// Curried utility to return the a given property from an object
export const prop = (property: string) => (obj: any) => obj[property]

/**
 * Generates a data scale for list of passed in values. Can accept any list of parameters, which might
 * include a min, middle, and max
 */
export const dataScaleFor = (...domain: number[]) =>
  [domain]
    .map(d3Scale100) // Domain -> Scale
    .map(clamp)[0] // Scale  -> Scale (clamped)

/**
 * Generate a stepped data scale for a given data extent, divided into a set of steps
 */
export const steppedDataScaleFor = (
  steps: number,
  dataMin: number,
  dataMax: number
) =>
  scaleQuantize()
    .domain([dataMin, dataMax])
    .range(linearSpace(0, 100, steps))

/**
 * Generates a color scale for palette, optionally defining whether or not palette should be reversed
 */
export const colorScaleFor = (reverse: boolean, palette: ContinuousPalette) => {
  const offsets = palette.stops.map(prop('offset'))
  if (reverse) {
    offsets.reverse()
  }

  return scaleLinear<string>()
    .domain(offsets)
    .range(palette.stops.map(prop('color')))
}

/**
 * Generates a color scale for value extents, optionally defining whether or not palette should be
 * reversed or quantized
 */
export const colorScaleForDataValues = (
  colors: string[],
  domain: number[],
  quantize: boolean
) =>
  quantize
    ? scaleQuantile<string>()
        .domain(domain)
        .range(colors)
    : scaleLinear<string, number>()
        .domain(domain)
        .range(colors)
        .clamp(true)

/**
 * Returns a color for given data value.  Requires a continuous palette and that an appropriate data scale
 * has been set that maps data to a 0 -> 100 scale.  Use `colorScaleFor` and `dataScaleFor`
 * to generate appropriate scales for your data.
 */
export const colorForDataValue = (
  colorScale: ScaleLinear<string, string>,
  dataScale: ScaleLinear<number, number>,
  data: number
) =>
  [data]
    .map(dataScale) // Data -> Number between (0 - 100)
    .map(colorScale)[0] // (0-100) -> Color

/**
 * Curried function that takes in a data array and passes back value in array given constraint.
 */
export const constraintCalculator = (
  numbers: Array<number | null | undefined>
) => (constraint: DataConstraint) => {
  const data = numbers.filter(n => n !== null && n !== undefined) as number[]
  data.sort((a, b) => a - b)

  switch (constraint.type) {
    case DataConstraintTypes.Average:
      return mean(data)
    case DataConstraintTypes.Maximum:
      return max(data)
    case DataConstraintTypes.Median:
      return median(data)
    case DataConstraintTypes.Middle:
      return mean([min(data), max(data)])
    case DataConstraintTypes.Minimum:
      return min(data)
    case DataConstraintTypes.Number:
      return constraint.value!
    case DataConstraintTypes.Percentile:
      return quantile(data, constraint.value! / 100.0)
    default:
      return constraint.value!
  }
}

/**
 * Returns a series of 3 constraints to mirror around a middle constraint
 */
export const mirroredConstraints = (data: number[], middle: DataConstraint) => {
  const middleVal = constraintCalculator(data)(middle)!

  const distanceFromMin = Math.abs(middleVal - min(data)!)
  const distanceFromMax = Math.abs(middleVal - max(data)!)

  const minConstraint = {
    type: DataConstraintTypes.Number,
    value: middleVal - Math.max(distanceFromMin, distanceFromMax),
  }

  const maxConstraint = {
    type: DataConstraintTypes.Number,
    value: middleVal + Math.max(distanceFromMin, distanceFromMax),
  }

  return [minConstraint, middle, maxConstraint]
}
