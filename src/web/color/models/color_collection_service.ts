import { Palette } from 'web/color/models/palette'
import { ColorCollection } from './color_collection'
import { FullColorCollectionService } from './full_color_collection_service'
import { ThemedColorCollectionService } from './themed_color_collection_service'

export interface IColorCollectionService {
  readonly builtInCollections: ColorCollection[]
  readonly customCollections: ColorCollection[]

  defaultCollection(): ColorCollection

  /**
   * Retrieve all available themes.
   */
  getAll(): ColorCollection[]

  getById(id: string): ColorCollection | undefined

  /**
   * Utility function that determines if a user has a saved custom color collection
   */
  hasSavedCustomCollection(): boolean

  isCustomCollection(collection: ColorCollection): boolean

  legacyCollection(): ColorCollection

  /**
   * Creates an empty custom collection to be filled-in and saved in the admin area
   */
  createDefaultCustomCollection(
    label: string,
    defaultColors: string[]
  ): ColorCollection
}

/**
 * Color collection service. Gives us access to some basic methods for interacting with color collections.
 * @class {ColorCollectionService}
 */
class InternalColorCollectionService implements IColorCollectionService {
  fullService: IColorCollectionService
  activeService: IColorCollectionService

  constructor() {
    this.activeService = this.fullService = new FullColorCollectionService()
  }

  setThemedCollectionId(themedId: string) {
    this.activeService = new ThemedColorCollectionService(themedId)
    return this.activeService
  }

  get builtInCollections(): ColorCollection[] {
    return this.activeService.builtInCollections
  }

  /**
   * Creates a default custom palette based on if you have custom collections or legacy admin colors
   */
  get customCollections(): ColorCollection[] {
    return this.activeService.customCollections
  }

  defaultCollection(): ColorCollection {
    return this.activeService.defaultCollection()
  }

  defaultPalette(paletteType: string): Palette | undefined {
    const defaultCollection = this.defaultCollection()
    return defaultCollection && defaultCollection.allPalettes
      ? this.defaultCollection().allPalettes.find(
          palette => palette.type === paletteType
        )
      : undefined
  }

  /**
   * Retrieve all available themes.
   */
  getAll(): ColorCollection[] {
    return this.activeService.getAll()
  }

  getById(id: string): ColorCollection | undefined {
    return this.activeService.getById(id)
  }

  /**
   * Utility function that determines if a user has a saved custom color collection
   */
  hasSavedCustomCollection(): boolean {
    return this.activeService.hasSavedCustomCollection()
  }

  isCustomCollection(collection: ColorCollection): boolean {
    return this.activeService.isCustomCollection(collection)
  }

  legacyCollection(): ColorCollection {
    return this.activeService.legacyCollection()
  }

  /**
   * Creates an empty custom collection to be filled-in and saved in the admin area
   */
  createDefaultCustomCollection(
    label: string = 'Create a color collection...',
    defaultColors: string[] = []
  ): ColorCollection {
    return this.activeService.createDefaultCustomCollection(
      label,
      defaultColors
    )
  }
}

// Acts as a singleton.
const ColorCollectionService = new InternalColorCollectionService()
export { ColorCollectionService }
