import { generateGUID } from '../utils/guid'
import { ContinuousPalette } from './continuous_palette'
import { DiscretePalette } from './discrete_palette'

const CUSTOM_PALETTE_LABEL = 'Custom'

/**
 * Setup a custom palette with a unique ID, "Custom" label and the specified colors.
 */
export const createCustomPalette = (
  colors: string[],
  isContinuous = false
): DiscretePalette | ContinuousPalette => {
  const id = generateGUID()
  const palette = isContinuous
    ? new ContinuousPalette(
        id,
        CUSTOM_PALETTE_LABEL,
        ContinuousPalette.stopsForColors(colors)
      )
    : new DiscretePalette(id, CUSTOM_PALETTE_LABEL, colors)
  palette.isCustom = true
  return palette
}
