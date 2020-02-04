import { ContinuousPalette as ContinuousPaletteType } from 'web/core_api/types/continuous_palette'
import { DiscretePalette as DiscretePaletteType } from 'web/core_api/types/discrete_palette'
import { ColorCollection } from '../models/color_collection'
import { ColorCollectionService } from '../models/color_collection_service'
import {
  ColorApplication,
  ColorApplicationOptions,
  PaletteType,
} from '../models/color_types'
import { ContinuousPalette } from '../models/continuous_palette'
import { createCustomPalette } from '../models/custom_palette'
import { DiscretePalette } from '../models/discrete_palette'
import { Palette } from '../models/palette'
import { ColorUtils } from './color_utils'

/**
 * Serializes a ColorCollection and Palette into a ColorApplication to be stored in the VisConfig
 * @param collection ColorCollection to serialize
 * @param palette Palette to serialize
 * @return a ColorApplication object that can be dropped into the VisConfig
 */
export const applicationForCollectionAndPalette = (
  collection: ColorCollection,
  palette?: Palette,
  options?: ColorApplicationOptions
): ColorApplication => {
  if (palette === undefined) {
    return {
      collection_id: collection.id,
      palette_id: collection.allPalettes[0].id,
      options,
    }
  } else if (palette.isCustom) {
    return {
      collection_id: collection.id,
      custom: palette.toJSON(),
      options,
    }
  } else {
    return {
      collection_id: collection.id,
      palette_id: palette.id,
      options,
    }
  }
}

const findPaletteByLabel = (
  colorCollection: ColorCollection,
  label?: string
): Palette | undefined => {
  if (!label || !label.includes || !label.includes('palette:')) {
    return undefined
  }
  const paletteLabel = label.split(':')[1].trim()
  return colorCollection.allPalettes.find(
    palette => palette.label === paletteLabel
  )
}

const findPaletteByHex = (
  colorCollection: ColorCollection,
  colors: string[] | undefined
): Palette | undefined => {
  if (!colors || colors.length === 0) {
    return undefined
  }
  const validColors = colors.filter(c => ColorUtils.isValidColor(c))
  if (validColors.length === 0) {
    return undefined
  }
  const palette = colorCollection.allPalettes.find(p =>
    p.hexCodesEqual(validColors)
  )
  if (!palette) {
    return createCustomPalette(validColors)
  }
  return palette
}

/**
 * DO NOT USE : This is exported purely for testing purposes.
 *
 * Returns a palette from the collection either by doing a look-up by label or matching the actual
 * color hex codes in the palette.
 */
export const legacyFindPalette = (
  legacyOption?: string | string[]
): Palette | undefined => {
  const colorCollection = ColorCollectionService.legacyCollection()
  if (legacyOption instanceof Array) {
    // An array of colors ['#f00', '#0f0', '#00f'] OR an array with a palette name ['palette: Looker Classic']
    if (
      legacyOption &&
      legacyOption.length === 1 &&
      legacyOption[0].includes('palette:')
    ) {
      // Check for a palette name
      const palette = findPaletteByLabel(colorCollection, legacyOption[0])
      if (palette) {
        return palette
      }
    } else {
      // An array of colors, find or construct the palette
      return findPaletteByHex(colorCollection, legacyOption)
    }
  } else {
    // A string palette name, or gibberish
    const palette = findPaletteByLabel(colorCollection, legacyOption)
    if (palette) {
      // It was a palette name, return that palette
      return palette
    }
  }
  return undefined
}

const getSelectedPalette = (
  colorCollection: ColorCollection,
  config?: ColorApplication,
  legacyOption?: string | string[],
  defaultPalette?: Palette
): Palette | undefined => {
  if (config && config.palette_id) {
    return (
      colorCollection.allPalettes.find(
        palette => palette.id === config.palette_id
      ) ||
      defaultPalette ||
      colorCollection.allPalettes[0]
    )
  } else if (config && config.custom) {
    const palette =
      config.custom.type === PaletteType.Discrete
        ? DiscretePalette.fromJSON(config.custom as DiscretePaletteType)
        : ContinuousPalette.fromJSON(config.custom as ContinuousPaletteType)

    palette.isCustom = true
    return palette
  }
  return legacyFindPalette(legacyOption)
}

/**
 * Returns the active ColorCollection given a ColorApplication
 * @param config a ColorApplication object from the VisConfig
 * @return the active ColorApplication
 */
export const colorCollectionForApplication = (
  config?: ColorApplication
): ColorCollection => {
  const allColorCollections = ColorCollectionService.getAll()
  const defaultCollection = ColorCollectionService.defaultCollection()
  if (config === undefined) {
    return defaultCollection
  } else {
    return (
      allColorCollections.find(
        collection => collection.id === config.collection_id
      ) || defaultCollection
    )
  }
}

/**
 * Returns the active palette given a ColorApplication and several fallback options.
 * @param config a ColorApplication object from the VisConfig
 * @param legacyOption an optional fallback option from the VisConfig (ie: `colors` from cartesian charts)
 * @param defaultPalette a Palette that acts as a default if we can't determine the selected Palette
 * @return the active Palette
 */
export const paletteForApplication = (
  config?: ColorApplication,
  legacyOption?: string | string[],
  defaultPalette?: Palette
): Palette => {
  const collection = colorCollectionForApplication(config)
  // We return the first palette as determined by this order:
  // 1 - The palette as defined in the vis config's color_application
  // 2 - The palette as defined by the legacy option in the vis config
  // 3 - The default palette if the vis specified one
  // 4 - The first palette in the selected collection
  return (
    getSelectedPalette(collection, config, legacyOption, defaultPalette) ||
    defaultPalette ||
    colorCollectionForApplication(config).allPalettes[0]
  )
}

/**
 * Determines whether a valid palette is specified in a VisConfig option.
 * @param visConfigOption a VisConfigValue that may contain a `palette: Looker Classic`-like string
 * @returns true if we can actually determine what palette that is, false otherwise
 */
export const validPaletteInVisConfig = (
  visConfigOption: string | string[]
): boolean => legacyFindPalette(visConfigOption) !== undefined

export const generateColorApplication = (
  legacyOption?: string | string[]
): ColorApplication =>
  applicationForCollectionAndPalette(
    colorCollectionForApplication(),
    paletteForApplication(undefined, legacyOption)
  )
