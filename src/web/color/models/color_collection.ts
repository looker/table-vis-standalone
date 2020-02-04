import { ColorCollection as ColorCollectionType } from 'web/core_api/types/color_collection'
import { ContinuousPalette as ContinuousPaletteType } from 'web/core_api/types/continuous_palette'
import { DiscretePalette as DiscretePaletteType } from 'web/core_api/types/discrete_palette'
import { ContinuousPalette } from './continuous_palette'
import { DiscretePalette } from './discrete_palette'
import { Palette } from './palette'

/**
 *  Models a grouping of similar and complementary color palettes.
 *  @class ColorCollection
 *  @constructor
 */
export class ColorCollection {
  /**
   * Returns a ColorCollection given some JSON object.
   */
  static fromJSON(json: ColorCollectionType): ColorCollection {
    const categoricalPalettes = json.categoricalPalettes.map(
      (paletteJSON: DiscretePaletteType) =>
        DiscretePalette.fromJSON(paletteJSON)
    )
    const sequentialPalettes = json.sequentialPalettes.map(
      (paletteJSON: ContinuousPaletteType) =>
        ContinuousPalette.fromJSON(paletteJSON)
    )
    const divergingPalettes = json.divergingPalettes.map(
      (paletteJSON: ContinuousPaletteType) =>
        ContinuousPalette.fromJSON(paletteJSON)
    )

    return new ColorCollection(
      json.id,
      json.label,
      categoricalPalettes,
      sequentialPalettes,
      divergingPalettes
    )
  }

  constructor(
    readonly id: string,
    readonly label: string,
    readonly categoricalPalettes: DiscretePalette[],
    readonly sequentialPalettes: ContinuousPalette[],
    readonly divergingPalettes: ContinuousPalette[]
  ) {}

  /**
   * Returns JSONified version object.
   */
  toJSON() {
    return {
      id: this.id,
      label: this.label,
      categoricalPalettes: this.categoricalPalettes.map(
        (palette: DiscretePalette) => palette.toJSON()
      ),
      sequentialPalettes: this.sequentialPalettes.map(
        (palette: ContinuousPalette) => palette.toJSON()
      ),
      divergingPalettes: this.divergingPalettes.map(
        (palette: ContinuousPalette) => palette.toJSON()
      ),
    }
  }

  /**
   * Returns a suggested palette for a given query result.
   */
  suggestedPaletteForQueryResult(/* result: QueryResult, visConfig: VisConfig */): Palette {
    return this.defaultCategoricalPalette
  }

  get allPalettes(): Palette[] {
    const allPalettes = [
      ...this.categoricalPalettes,
      ...this.sequentialPalettes,
      ...this.divergingPalettes,
    ]
    return allPalettes
  }

  /**
   * Returns an array of default palettes.
   */
  get defaultPalettes(): Palette[] {
    return [
      this.defaultCategoricalPalette,
      this.defaultSequentialPalette,
      this.defaultDivergingPalette,
    ]
  }

  /**
   * Returns the default categorical palette.
   */
  get defaultCategoricalPalette(): DiscretePalette {
    return this.defaultPalette(this.categoricalPalettes) as DiscretePalette
  }

  /**
   * Returns the default sequential palette.
   */
  get defaultSequentialPalette(): ContinuousPalette {
    return this.defaultPalette(this.sequentialPalettes) as ContinuousPalette
  }

  /**
   * Returns the default diverging palette.
   */
  get defaultDivergingPalette(): ContinuousPalette {
    return this.defaultPalette(this.divergingPalettes) as ContinuousPalette
  }

  /**
   * Returns the other categorical palettes.
   */
  get otherCategoricalPalettes(): DiscretePalette[] {
    return this.otherPalettes(this.categoricalPalettes) as DiscretePalette[]
  }

  /**
   * Returns the other sequential palettes.
   */
  get otherSequentialPalettes(): ContinuousPalette[] {
    return this.otherPalettes(this.sequentialPalettes) as ContinuousPalette[]
  }

  /**
   * Returns the other diverging palettes.
   */
  get otherDivergingPalettes(): ContinuousPalette[] {
    return this.otherPalettes(this.divergingPalettes) as ContinuousPalette[]
  }

  /**
   * Private utility methods to centrally define 'default' palette in a given list.
   * These currently assume the default palette is the first in the list.  We might consider
   * being more explicit later.
   */
  private defaultPalette(palettes: Palette[]): Palette {
    return palettes[0]
  }

  /**
   * Private utility methods to centrally define 'other' palettes in a given list.
   */
  private otherPalettes(palettes: Palette[]): Palette[] {
    const [, ...rest] = palettes
    return rest
  }
}
