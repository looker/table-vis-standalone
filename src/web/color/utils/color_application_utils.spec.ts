import { ColorCollection as ColorCollectionType } from 'assets/core_api/types/color_collection'
import COLLECTIONS_JSON from 'test/tests/testdata/color_collections/world_cup_hosts.json'
import { ColorCollection } from '../models/color_collection'
import { ColorCollectionService } from '../models/color_collection_service'

import { createCustomPalette } from '../models/custom_palette'
import {
  applicationForCollectionAndPalette,
  colorCollectionForApplication,
  legacyFindPalette,
  paletteForApplication,
} from './color_application_utils'

describe('Color Application Utils', () => {
  const customDiscretePalette = createCustomPalette(['#000', '#111', '#222'])
  const customContinuousPalette = createCustomPalette(['#000', '#FFF'], true)

  beforeEach(() => {
    const collections = COLLECTIONS_JSON.colorCollections.map(
      (json: ColorCollectionType) => ColorCollection.fromJSON(json)
    )
    spyOn(ColorCollectionService.activeService, 'getAll').and.returnValue(
      collections
    )
    ;(window as any).slipstream = {
      appState: {},
    }
  })

  afterEach(() => {
    delete (window as any).slipstream
  })

  describe('colorCollectionForApplication', () => {
    it('should by default return the legacy color collection', () => {
      const collection = colorCollectionForApplication()
      expect(collection.id).toEqual('legacy')
      expect(collection.categoricalPalettes.length).toEqual(3)
      expect(collection.sequentialPalettes.length).toEqual(2)
      expect(collection.divergingPalettes.length).toEqual(2)
      const defaultPalette = collection.categoricalPalettes[0]
      expect(defaultPalette.label).toEqual('Default Categorical')
      expect(defaultPalette.colors).toEqual(['#FF0000', '#FFFFFF', '#0000FF'])
    })

    it('should return the color collection for the specified collection id', () => {
      const collection = colorCollectionForApplication({
        collection_id: 'electric_boogaloo',
      })
      expect(collection.id).toEqual('electric_boogaloo')
      expect(collection.label).toEqual('Collection 2')
      expect(collection.categoricalPalettes.length).toEqual(2)
      expect(collection.sequentialPalettes.length).toEqual(2)
      expect(collection.divergingPalettes.length).toEqual(2)
    })

    it('should return the legacy collection if we cannot find a collection with the given id', () => {
      const collection = colorCollectionForApplication({
        collection_id: 'does_not_exist',
      })
      expect(collection.id).toEqual('legacy')
    })
  })

  describe('paletteForApplication', () => {
    const defaultPalette = createCustomPalette(['#aaa', '#bbb', '#ccc'])

    it('should look up a palette by collection and palette id if given', () => {
      const palette = paletteForApplication(
        {
          collection_id: 'electric_boogaloo',
          palette_id: 'categorical_2',
        },
        ['palette: Other Sequential 1'],
        defaultPalette
      )
      expect(palette.label).toEqual('Categorical 2')
      expect(palette.sample(3)).toEqual(['#00FFFF', '#FF00FF', '#FFFF00'])
    })

    it('should return the first palette if palette id is invalid and no default passed', () => {
      const palette = paletteForApplication(
        {
          collection_id: 'electric_boogaloo',
          palette_id: 'does_not_exist',
        },
        ['palette: Other Sequential 1'],
        undefined
      )
      expect(palette.label).toEqual('Categorical 1')
      expect(palette.sample(3)).toEqual(['#FF0000', '#00FF00', '#0000FF'])
    })

    it('should return the default if palette id is invalid', () => {
      const palette = paletteForApplication(
        {
          collection_id: 'electric_boogaloo',
          palette_id: 'does_not_exist',
        },
        ['palette: Other Sequential 1'],
        defaultPalette
      )
      expect(palette).toEqual(defaultPalette)
    })

    it('should create a custom discrete palette if specified in the color application', () => {
      const palette = paletteForApplication(
        {
          collection_id: 'electric_boogaloo',
          custom: customDiscretePalette.toJSON(),
        },
        ['palette: Other Sequential 1'],
        defaultPalette
      )
      expect(palette.label).toEqual('Custom')
      expect(palette.sample(3)).toEqual(['#000', '#111', '#222'])
    })

    it('should create a custom continuous palette if specified in the color application', () => {
      const palette = paletteForApplication(
        {
          collection_id: 'electric_boogaloo',
          custom: customContinuousPalette.toJSON(),
        },
        ['palette: Other Sequential 1'],
        defaultPalette
      )
      expect(palette.label).toEqual('Custom')
      expect(palette.sample(3)).toEqual(['#000000', '#808080', '#ffffff'])
    })

    it('should fallback to the legacy option without a color application', () => {
      const palette = paletteForApplication(
        undefined,
        ['palette: Other Sequential 1'],
        defaultPalette
      )
      expect(palette.label).toEqual('Other Sequential 1')
      expect(palette.sample(3)).toEqual(['#ffffff', '#ff8080', '#ff0000'])
    })

    it('should fallback to the default palette without a color application or legacy option', () => {
      const palette = paletteForApplication(
        undefined,
        undefined,
        defaultPalette
      )
      expect(palette).toEqual(defaultPalette)
    })

    it('should return the first palette in the legacy collection when all else fails', () => {
      const palette = paletteForApplication()
      expect(palette.label).toEqual('Default Categorical')
      expect(palette.sample(3)).toEqual(['#FF0000', '#FFFFFF', '#0000FF'])
    })
  })

  describe('legacyFindPalette', () => {
    it('should identify a palette by label in array form', () => {
      const palette = legacyFindPalette(['palette: Other Categorical 1'])
      expect(palette!.label).toEqual('Other Categorical 1')
      expect(palette!.sample(2)).toEqual(['#FF0000', '#FFFFFF'])
    })

    it('should return a matching palette for a set of colors', () => {
      const colors = ['#FF0000', '#FFFFFF', '#00FF00']
      const palette = legacyFindPalette(colors)
      expect(palette!.label).toEqual('Other Categorical 2')
      expect(palette!.sample(3)).toEqual(colors)
    })

    it('should return undefined if an invalid palette is passed in', () => {
      const palette = legacyFindPalette([])
      expect(palette).toBeUndefined()
    })

    it('should echo the palette back as custom if it matches nothing', () => {
      const colors = ['#F00', '#0F0', '#00F']
      const palette = legacyFindPalette(colors)
      expect(palette!.label).toEqual('Custom')
      expect(palette!.sample()).toEqual(colors)
    })

    it('should identify the palette by label in string form', () => {
      const palette = legacyFindPalette('palette: Other Categorical 1')
      expect(palette!.label).toEqual('Other Categorical 1')
      expect(palette!.sample(2)).toEqual(['#FF0000', '#FFFFFF'])
    })

    it('should return undefined if given a gibberish string', () => {
      const palette = legacyFindPalette('gibberish')
      expect(palette).toBeUndefined()
    })

    it('should return undefined if given a gibberish palette', () => {
      const palette = legacyFindPalette(['palette: Gibberish'])
      expect(palette).toBeUndefined()
    })

    it('should return undefined if the default palette was set and then removed from the instance', () => {
      const palette = legacyFindPalette(['palette: Default'])
      expect(palette).toBeUndefined()
    })
  })

  describe('applicationForCollectionAndPalette', () => {
    let collection: ColorCollection

    beforeEach(() => {
      collection = colorCollectionForApplication()
    })

    it('should store the collection id and first palette id if not given a palette', () => {
      const colorApplication = applicationForCollectionAndPalette(collection)
      expect(colorApplication.collection_id).toEqual(collection.id)
      expect(colorApplication.palette_id).toEqual(collection.allPalettes[0].id)
    })

    it('should return the collection and palette id from the parameters', () => {
      const colorApplication = applicationForCollectionAndPalette(
        collection,
        collection.sequentialPalettes[0]
      )
      expect(colorApplication.collection_id).toEqual(collection.id)
      expect(colorApplication.palette_id).toEqual('usa_sequential')
    })

    it('should return the collection id and a serialized discrete palette for custom discrete', () => {
      const colorApplication = applicationForCollectionAndPalette(
        collection,
        customDiscretePalette
      )
      expect(colorApplication.collection_id).toEqual(collection.id)
      expect(colorApplication.custom).toEqual(customDiscretePalette.toJSON())
    })

    it('should return the collection id and a serialized continuous palette for custom continuous', () => {
      const colorApplication = applicationForCollectionAndPalette(
        collection,
        customContinuousPalette
      )
      expect(colorApplication.collection_id).toEqual(collection.id)
      expect(colorApplication.custom).toEqual(customContinuousPalette.toJSON())
    })
  })
})
