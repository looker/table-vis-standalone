import { ColorStop } from 'web/core_api/types/color_stop'
import { ContinuousPalette as ContinuousPaletteType } from 'web/core_api/types/continuous_palette'
import { rgb } from 'd3-color'
import isEqual from 'lodash/isEqual'
import { ColorUtils } from '../utils/color_utils'
import { PaletteType } from './color_types'
import { colorScaleFor, linearSpace } from './data_mapping'

import { Palette } from './palette'

/**
 *  Models a continuous palette which has a continuous range of colors
 *  defined over a range of color stops.
 *  @class ContinuousPalette
 *  @constructor
 */
export class ContinuousPalette extends Palette {
  /**
   * Returns a ContinuousPalette given some JSON object.
   */
  static fromJSON(json: ContinuousPaletteType): ContinuousPalette {
    return new ContinuousPalette(json.id, json.label, [...json.stops])
  }

  /**
   * Static utility to generate an array of evenly spaced stops for a given set of colors.
   */
  static stopsForColors(colors: string[]): ColorStop[] {
    return linearSpace(0, 100, colors.length).map((percent, index) => ({
      color: colors[index],
      offset: percent,
    }))
  }

  constructor(
    readonly id: string,
    readonly label: string | null,
    readonly stops: ColorStop[]
  ) {
    super(id, label, PaletteType.Continuous)
    this.colors = this.stops.map((stop: ColorStop) => stop.color)
  }

  cssString(reverse: boolean = false): string {
    const stopColors = this.stops.map(stop => stop.color)
    if (reverse) stopColors.reverse()
    return ColorUtils.cssGradientForColors(stopColors, 'right')
  }

  hexCodesEqual(colors: string[]): boolean {
    const sanitizedInput = colors.map(c => rgb(c).hex())
    const myColors = this.sample(colors.length)
    return isEqual(sanitizedInput, myColors)
  }

  /**
   * Generate n evenly spaced stops across palette. Override of base class.
   */
  sample(
    numSamples = Palette.DEFAULT_SAMPLES,
    reverse: boolean = false
  ): string[] {
    const scale = colorScaleFor(reverse, this)
    return linearSpace(0, 100, numSamples).map(percent =>
      rgb(scale(percent)).hex()
    )
  }

  /**
   * Returns JSONified version of continuous palette.
   */
  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      stops: [...this.stops],
    }
  }
}
