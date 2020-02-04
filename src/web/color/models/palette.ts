import { ContinuousPalette as ContinuousPaletteType } from 'web/core_api/types/continuous_palette'
import { DiscretePalette as DiscretePaletteType } from 'web/core_api/types/discrete_palette'
import { PaletteType } from './color_types'

/**
 * Abstract concept of a palette. Not meant to be instantiated directly, and should be subclassed.
 */
export abstract class Palette {
  static readonly DEFAULT_SAMPLES = 12

  colors: string[] = []
  /**
   * This is not persisted and must be set-up client side.
   * fromJSON and createCustomPalette handle this for you.
   */
  isCustom: boolean

  constructor(
    readonly id: string,
    readonly label: string | null,
    readonly type: string
  ) {
    this.isCustom = false
  }

  isContinuous(): boolean {
    return this.type === PaletteType.Continuous
  }

  isDiscrete(): boolean {
    return this.type === PaletteType.Discrete
  }

  /**
   * Abstract method to determine whether a set of color hex codes are equal to this palette's colors.
   */
  abstract hexCodesEqual(colors: string[]): boolean

  /**
   * Abstract method to provide a sampling of palette in the form of hex codes.
   */
  abstract sample(numSamples?: number, reverse?: boolean): string[]

  /**
   * Returns JSONified base properties for palette.
   */
  abstract toJSON(): DiscretePaletteType | ContinuousPaletteType
}
