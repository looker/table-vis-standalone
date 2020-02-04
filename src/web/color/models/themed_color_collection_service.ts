import { ColorCollection } from './color_collection'
import {
  ColorCollectionService,
  IColorCollectionService,
} from './color_collection_service'

export class ThemedColorCollectionService implements IColorCollectionService {
  builtInCollections: ColorCollection[]
  customCollections: ColorCollection[]

  constructor(themedId: string) {
    const collection = ColorCollectionService.fullService.getById(themedId)
    if (collection) {
      this.builtInCollections = [collection]
      this.customCollections = ColorCollectionService.fullService.isCustomCollection(
        collection
      )
        ? [collection]
        : []
    } else {
      throw new Error(`Color Collection ID '#themedId' was not found`)
    }
  }

  createDefaultCustomCollection(
    label: string,
    defaultColors: string[]
  ): ColorCollection {
    throw new Error(
      'Themed Color Collections cannot create default custom collections'
    )
  }

  defaultCollection(): ColorCollection {
    return this.builtInCollections[0]
  }

  getAll(): ColorCollection[] {
    return this.builtInCollections
  }

  getById(id: string): ColorCollection | undefined {
    return this.builtInCollections[0]
  }

  hasSavedCustomCollection(): boolean {
    return this.customCollections.length > 0
  }

  isCustomCollection(collection: ColorCollection): boolean {
    return (
      this.customCollections.length > 0 &&
      collection.id === this.customCollections[0].id
    )
  }

  legacyCollection(): ColorCollection {
    // TODO should this return undefined, the delegate method, or throw an error?
    return ColorCollectionService.fullService.legacyCollection()
  }
}
