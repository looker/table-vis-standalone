import { DiscretePalette as DiscretePaletteType } from 'web/core_api/types/discrete_palette'
import { rgb } from 'd3-color'
import isEqual from 'lodash/isEqual'
import { ColorUtils } from '../utils/color_utils'
import { PaletteType } from './color_types'
import { Palette } from './palette'

/**
 *  Models a discrete palette which has a finite set of defined colors.
 *  @class DiscretePalette
 *  @constructor
 */
export class DiscretePalette extends Palette {
  /**
   * Returns a DiscretePalette given some JSON object.
   */
  static fromJSON(json: DiscretePaletteType): DiscretePalette {
    return new DiscretePalette(json.id, json.label, [...json.colors])
  }

  constructor(
    readonly id: string,
    readonly label: string | null,
    readonly colors: string[]
  ) {
    super(id, label, PaletteType.Discrete)
  }

  hexCodesEqual(colors: string[]): boolean {
    const sanitizedInput = colors.map(c => rgb(c).hex())
    const myColors = this.colors.map(c => rgb(c).hex())
    return isEqual(sanitizedInput, myColors)
  }

  /**
   * Generate n samples of palette by constantly iterating over discrete steps.
   */
  sample(numSamples = this.colors.length, reverse = false): string[] {
    if (numSamples <= 0) {
      return []
    }
    const allColors = ColorUtils.generateColorCycles(this.colors, reverse)
    const samples = new Array(numSamples)
    for (let i = 0; i < numSamples; i++) {
      samples[i] = allColors[i % allColors.length]
    }
    return samples
  }

  /**
   * Returns JSONified version of object.
   */
  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      colors: [...this.colors],
    }
  }
}
