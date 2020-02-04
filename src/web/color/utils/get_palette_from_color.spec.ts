import { getPaletteFromColor } from './get_palette_from_color'

describe('getPaletteFromColor', () => {
  it('should return a palette', () => {
    expect(getPaletteFromColor('white')).toMatchSnapshot('white')
    expect(getPaletteFromColor('purple')).toMatchSnapshot('purple')
  })

  it('should accept invalid colors and return default palette', () => {
    expect(getPaletteFromColor('not a color')).toMatchSnapshot()
    expect(getPaletteFromColor('')).toMatchSnapshot()
  })
})
