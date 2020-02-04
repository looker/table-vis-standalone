import { hsl, rgb, RGBColor } from 'd3-color'
import isArray from 'lodash/isArray'
import zip from 'lodash/zip'

function toHexOrRgb(color: RGBColor) {
  if (color.opacity === 1.0) {
    return color.hex()
  } else {
    return color.toString()
  }
}

export class ColorUtils {
  // Mixes two d3 colors, returning a new d3 color
  // Adjust mix percentage with p
  // Based on:
  // http://sass-lang.com/documentation/Sass/Script/Functions.html#mix-instance_method
  static mixColors(
    color1: RGBColor,
    color2: RGBColor,
    p: number = 0.5
  ): RGBColor {
    const w = p * 2 - 1
    const a = 0

    const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0
    const w2 = 1 - w1

    const result = zip(
      [color1.r, color1.g, color1.b],
      [color2.r, color2.g, color2.b]
    ).map(arr => {
      const [v1, v2] = arr
      return v1! * w1 + v2! * w2
    })
    return rgb(result[0], result[1], result[2])
  }

  static generateColorCycles(colors: string[], reverse: boolean = false) {
    const cycle2 = colors.map(x =>
      toHexOrRgb(ColorUtils.mixColors(rgb(x), rgb('white'), 0.6))
    )
    const cycle3 = colors.map(x =>
      toHexOrRgb(ColorUtils.mixColors(rgb(x), rgb('black'), 0.6))
    )
    if (reverse) {
      return colors
        .slice()
        .reverse()
        .concat(cycle2.reverse())
        .concat(cycle3.reverse())
    }
    return colors.concat(cycle2).concat(cycle3)
  }

  static colorForBlackBackground(color: string) {
    const result = hsl(color)
    if (result.l < 0.7) {
      result.l = 0.7
    }
    return toHexOrRgb(result.rgb())
  }

  static colorForWhiteBackground(color: string) {
    const result = hsl(color)
    if (result.l > 0.5) {
      result.l = 0.5
    }
    return toHexOrRgb(result.rgb())
  }

  static textColorForBackgroundColor(backgroundColor: string) {
    const nThreshold = 60
    const color = rgb(backgroundColor)
    const bgDelta = color.r * 0.299 + color.g * 0.587 + color.b * 0.114
    return 255 - bgDelta < nThreshold ? '#000000' : '#ffffff'
  }

  static rgbToHex(color: string) {
    const parts = color.match(
      /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
    )
    if (parts && parts.length === 4) {
      return (
        '#' +
        ('0' + parseInt(parts[1], 10).toString(16)).slice(-2) +
        ('0' + parseInt(parts[2], 10).toString(16)).slice(-2) +
        ('0' + parseInt(parts[3], 10).toString(16)).slice(-2)
      )
    } else {
      return ''
    }
  }

  static transparentize(color: string, alpha: number) {
    const result = rgb(color)
    return `rgba(${result.r}, ${result.g}, ${result.b}, ${alpha})`
  }

  static isValidColor(color: string | null) {
    if (!color) {
      return false
    }

    if (
      color === 'black' ||
      color === '#000' ||
      color === '#000000' ||
      color === 'rgb(0,0,0)'
    ) {
      return true
    }

    // We have a valid color if color is not black.
    return ColorUtils.sanitizeColor(color) !== '#000000'
  }

  // User-inputted colors are an HTML injection vector
  static sanitizeColor(color: string) {
    if (!color) {
      return ''
    }
    if (color === 'transparent') {
      return color
    }
    let result = rgb(color)
    if (!result.displayable()) {
      result = rgb(0, 0, 0)
    }
    return toHexOrRgb(result)
  }

  static sanitizeColors(colors: string[]) {
    return (colors || []).map(c => ColorUtils.sanitizeColor(c))
  }

  // return a list of 2 or more colors, given flexible inputs
  static colorsForColorScale(
    userColors: null | string[],
    defaultColors: string[]
  ) {
    // userColors may be like any of null, [], ['red'], ['red', 'green', 'blue']
    // defaultColors must be a list of colors
    if (userColors) {
      let configColors: string[] = isArray(userColors)
        ? userColors
        : [userColors]
      if (configColors && configColors.length > 0) {
        configColors = ColorUtils.sanitizeColors(configColors)
        // If a single color is supplied, pair it with one of the defaults
        if (configColors.length === 1) {
          configColors.unshift(defaultColors[0])
        }
        return configColors
      }
    }
    return defaultColors
  }

  static cssGradientForColors(
    colors: string[],
    direction: string,
    quantize = false,
    reverse = false
  ) {
    const colorsCopy = [...colors]
    let gradientColors: string[] = []

    if (quantize) {
      for (let i = 0; i < colors.length; i++) {
        gradientColors.push(
          `${colorsCopy[i]} ${i * (1 / colorsCopy.length) * 100}%`
        )
        gradientColors.push(
          `${colorsCopy[i]} ${(i + 1) * (1 / colorsCopy.length) * 100}%`
        )
      }
    } else {
      gradientColors = colorsCopy
    }

    if (reverse) {
      gradientColors.reverse()
    }

    const standard = `background:linear-gradient(to ${direction}, ${gradientColors.join(
      ','
    )})`

    // PhantomJS doesn't support the w3c gradients
    // So here's the stupid old legacy webkit syntax
    const stops = gradientColors
      .map((c, i) => {
        let [color, percent] = c.split(' ')
        if (!percent) {
          percent = `${i * (1 / (gradientColors.length - 1)) * 100}%`
        }
        return `color-stop(${percent}, ${color})`
      })
      .join(', ')
    let cssDir = ''
    if (direction === 'right') {
      cssDir = 'left top, right top'
    } else if (direction === 'left') {
      cssDir = 'right top, left top'
    } else if (direction === 'top') {
      cssDir = 'center bottom, center top'
    } else if (direction === 'bottom') {
      cssDir = 'center top, center bottom'
    }
    const legacy = `background:-webkit-gradient(linear, ${cssDir}, ${stops})`

    return `${legacy};${standard};`
  }
}
