// import AppState from 'web/common/slipstream/app_state'
import { ColorCollection as ColorCollectionType } from 'web/core_api/types/color_collection'
import { generateGUID } from '../utils/guid'
import { ColorCollection } from './color_collection'
import { IColorCollectionService } from './color_collection_service'
import { DiscretePalette } from './discrete_palette'
// Eventually this will get replaced with Color Collection API calls
import FIXTURES from 'web/data/color_collections.json'

const COLOR_COLLECTION_LEGACY_ID = 'legacy'


export class FullColorCollectionService implements IColorCollectionService {
  builtInCollections: ColorCollection[]

  constructor() {
    this.builtInCollections = FIXTURES.colorCollections.map((json: any) =>
      ColorCollection.fromJSON(json as ColorCollectionType)
    )
  }

  defaultCollection(): ColorCollection {
    return this.legacyCollection()
    // const newAdminDefault = this.getAll().find(
    //   c => c.id === AppState.state.adminDefaultColorCollection
    // )
    // const oldAdminDefault =
    //   AppState.state.adminDefaultColors &&
    //   AppState.state.adminDefaultColors.length
    //     ? this.createDefaultCustomCollection(
    //         'Company Colors',
    //         AppState.state.adminDefaultColors
    //       )
    //     : undefined
    // return newAdminDefault || oldAdminDefault || this.legacyCollection()
  }

  /**
   * Retrieve all available themes.
   */
  getAll(): ColorCollection[] {
    return [...this.customCollections, ...this.builtInCollections]
  }

  getById(id: string): ColorCollection | undefined {
    return this.getAll().find(c => c.id === id)
  }

  /**
   * Utility function that determines if a user has a saved custom color collection
   */
  hasSavedCustomCollection(): boolean {
    return false
    // return !!(
    //   (AppState.state.customColorCollections &&
    //     AppState.state.customColorCollections.length) ||
    //   (AppState.state.adminDefaultColors &&
    //     AppState.state.adminDefaultColors.length)
    // )
  }

  isCustomCollection(collection: ColorCollection): boolean {
    return (
      this.customCollections.find(c => c.id === collection.id) !== undefined
    )
  }

  legacyCollection(): ColorCollection {
    return this.getAll().find(c => c.id === COLOR_COLLECTION_LEGACY_ID)!
  }

  /**
   * Creates an empty custom collection to be filled-in and saved in the admin area
   */
  createDefaultCustomCollection(
    label: string = 'Create a color collection...',
    defaultColors: string[] = []
  ): ColorCollection {
    return new ColorCollection(
      '__UNSAVED_MODEL__',
      label,
      defaultColors.length
        ? [
            new DiscretePalette(
              generateGUID(),
              'Legacy Admin Colors',
              defaultColors
            ),
          ]
        : [],
      [],
      []
    )
  }

  /**
   * Creates a default custom palette based on if you have custom collections or legacy admin colors
   */
  get customCollections(): ColorCollection[] {
    // if there are custom defined collections, return them here
    // if (
    //   AppState.state.customColorCollections &&
    //   AppState.state.customColorCollections.length
    // ) {
    //   return AppState.state.customColorCollections.map(coll =>
    //     ColorCollection.fromJSON(coll)
    //   )
    // }

    // // if there are no defined collections but there are legacy admin colors,
    // // return the default collection with the legacy colors added
    // if (
    //   AppState.state.adminDefaultColors &&
    //   AppState.state.adminDefaultColors.length
    // ) {
    //   return [
    //     this.createDefaultCustomCollection(
    //       'Company Colors',
    //       AppState.state.adminDefaultColors
    //     ),
    //   ]
    // }

    // if there are no custom collections or legacy defaults, return nothing
    return []
  }
}
