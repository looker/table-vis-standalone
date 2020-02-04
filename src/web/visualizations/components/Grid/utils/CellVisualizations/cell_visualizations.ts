import { ContinuousPalette } from 'web/color/models/continuous_palette'
import { createCustomPalette } from 'web/color/models/custom_palette'
import { QueryResponseExtentsCalculator } from 'web/visualizations/components/Grid/utils/query_response_extents_calculator_generator'
import {
  colorForDataValue,
  colorScaleFor,
  dataScaleFor,
} from 'web/color/models/data_mapping'
import {
  colorCollectionForApplication,
  paletteForApplication,
} from 'web/color/utils/color_application_utils'
import { valueFormatter } from 'web/visualizations/components/Grid/utils/chart_utils'
import { Cell, QueryResponse } from '../../../../types/query_response'
import { VisConfig } from '../../../../types/vis_config'
import { DEFAULT_CELL_VIS, NUMBER_WIDTH_MULTIPLIER } from '../grid_constants'
import { CellVisualizationBar, getBar } from './cell_bar'

interface PossibleVisualizations {
  [key: string]: {
    visualization: (
      visualization: CellVisualizationBar,
      queryStats: QueryStat,
      cell: Cell,
      html: string
    ) => string
  }
}

export interface QueryStats {
  [key: string]: QueryStat
}

export interface QueryStat {
  min?: number
  max?: number
  isFirstMeasure?: boolean
  textLength?: number
}

const possibleVisualizations = {
  bar: {
    visualization: getBar as () => string,
  },
} as PossibleVisualizations

export const getCellVisualization = (
  visualization: CellVisualizationBar,
  queryStats: QueryStat,
  cell: Cell,
  html: string
) => {
  const selectedVisualization =
    visualization.selected_visualization || DEFAULT_CELL_VIS
  return possibleVisualizations[selectedVisualization].visualization(
    visualization,
    queryStats,
    cell,
    html
  )
}

export const getQueryStats = (
  queryResponse: QueryResponse,
  config: VisConfig
) => {
  const seriesValueFormat = config.series_value_format || {}
  const firstMeasure = queryResponse.fields.measures[0]
  const firstMeasureName = firstMeasure
    ? queryResponse.fields.measures[0].name
    : ''
  const stats = {} as QueryStats
  const rowFontSize = Number(config.rows_font_size || 12)
  // cycles through all the series cell visualization keys and apply a queryStat to each of them
  // the queryStat allows us to look at the entire set to determine the min, max, and length of the value's text
  for (const field in config.series_cell_visualizations) {
    const seriesVis = config.series_cell_visualizations[field]
    if (seriesVis.is_active) {
      const seriesFormat = seriesValueFormat[field]
      // if display value is false then we can skip finding the value format, but
      // otherwise we first look to see if we have it defined in the visconfig and
      // then we check if there is one in the query response
      const valueFormat =
        seriesVis.value_display === false
          ? ''
          : seriesFormat
          ? seriesFormat.format_string || ''
          : (
              queryResponse.fields.measure_like.find(
                measure => measure.name === field
              ) || {}
            ).value_format || ''
      stats[field] = queryStatCalculator(
        queryResponse,
        field,
        firstMeasureName,
        valueFormat,
        rowFontSize
      )
    }
  }

  // The default is to have the first measure to have the bars visualization
  // However only if that measure is a number that can be used in calcs
  if (
    !config.series_cell_visualizations &&
    firstMeasure &&
    firstMeasure.category === 'measure'
  ) {
    const valueFormat = seriesValueFormat[firstMeasureName]
      ? seriesValueFormat[firstMeasureName].format_string
      : queryResponse.fields.measures[0]?.value_format
    stats[firstMeasureName] = queryStatCalculator(
      queryResponse,
      firstMeasureName,
      firstMeasureName,
      valueFormat,
      rowFontSize
    )
  }
  return stats
}

const queryStatCalculator = (
  queryResponse: QueryResponse,
  field: string,
  firstMeasureName: string,
  valueFormat: string,
  fontSize: number
) => {
  const seriesData = new QueryResponseExtentsCalculator(
    [field],
    queryResponse.data,
    queryResponse.totals_data,
    !!queryResponse.pivots,
    false,
    false,
    undefined
  )
  return {
    ...cellVisExtent(seriesData.aggregateData(), valueFormat, fontSize),
    isFirstMeasure: firstMeasureName === field,
  }
}

const cellVisExtent = (
  values: number[] | null[],
  valueFormat: string,
  fontSize: number
) => {
  const extent = {} as QueryStat
  for (const value of values) {
    if (value !== null) {
      if (
        extent.min === undefined ||
        extent.max === undefined ||
        extent.textLength === undefined
      ) {
        extent.min = extent.max = value
        extent.textLength =
          valueFormatter(value, valueFormat).length *
          fontSize *
          NUMBER_WIDTH_MULTIPLIER
      } else {
        if (extent.min > value) extent.min = value
        if (extent.max < value) extent.max = value
        const currentTextLength =
          valueFormatter(value, valueFormat).length *
          fontSize *
          NUMBER_WIDTH_MULTIPLIER
        if (extent.textLength < currentTextLength) {
          extent.textLength = currentTextLength
        }
      }
    }
  }
  return extent
}

export const getCellVis = (
  config: VisConfig,
  measure: string,
  isTotal = false
) =>
  !isTotal &&
  config.series_cell_visualizations &&
  config.series_cell_visualizations[measure]
    ? config.series_cell_visualizations[measure]
    : {}

export const getVisualizationColor = (
  value: number,
  visualization: CellVisualizationBar,
  queryStats: QueryStat
) => {
  let applicationPalette
  const palette = visualization.palette
  if (palette && palette.custom_colors) {
    applicationPalette = paletteForApplication(
      undefined,
      undefined,
      createCustomPalette(palette.custom_colors, true)
    )
  } else {
    const defaultColors = colorCollectionForApplication()
    applicationPalette = palette
      ? paletteForApplication(palette)
      : defaultColors.sequentialPalettes[
          defaultColors.sequentialPalettes.length - 1
        ]
  }
  const dataScale = dataScaleFor(
    queryStats.min as number,
    queryStats.max as number
  )
  const colorScale = colorScaleFor(
    false,
    applicationPalette as ContinuousPalette
  )
  return colorForDataValue(colorScale, dataScale, value)
}
