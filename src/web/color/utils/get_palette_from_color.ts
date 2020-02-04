import { hsl } from 'd3-color'

/**
 * This function returns a generated color palette based on a base color.
 * The Lightness values are derived-estimates from the Lens color-shade distributions.
 */
export const getPaletteFromColor = (color: string) => {
  const { h, s } = hsl(color)
  return {
    color000: hsl(h, s, 0.97).hex(),
    color100: hsl(h, s, 0.95).hex(),
    color200: hsl(h, s, 0.9).hex(),
    color300: hsl(h, s, 0.75).hex(),
    color400: hsl(h, s, 0.6).hex(),
    color500: hsl(h, s, 0.45).hex(),
    color600: hsl(h, s, 0.35).hex(),
    color700: hsl(h, s, 0.3).hex(),
    color800: hsl(h, s, 0.23).hex(),
    color900: hsl(h, s, 0.17).hex(),
  } as ColorPalette
}

export interface ColorPalette {
  color000: string
  color100: string
  color200: string
  color300: string
  color400: string
  color500: string
  color600: string
  color700: string
  color800: string
  color900: string
}
