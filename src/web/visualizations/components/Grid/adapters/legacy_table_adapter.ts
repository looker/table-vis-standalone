import { QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import { preprocessQueryResponse } from 'web/visualizations/components/Grid/utils/query_utils'
import { gridMapper } from '../mappers/grid_mapper'
import '../styles/grid_themes.scss'

const getLegacyConfig = (config: VisConfig, result: QueryResponse) => {
  const legacyConfig = { ...config }
  const { fields } = result
  // disables default bars for legacy table
  if (fields.measures && fields.measures[0]) {
    legacyConfig.series_cell_visualizations = {
      [fields.measures[0].name]: { is_active: false },
    }
  }
  // default disables truncate column name
  legacyConfig.truncate_text = !!config.truncate_column_names

  return legacyConfig
}

export const legacyTableAdapter = (
  config: VisConfig,
  result: QueryResponse
) => {
  const processedResult = preprocessQueryResponse(result, config)
  if (!processedResult) return {}
  const legacyConfig = getLegacyConfig(config, result)
  const visTriggerCb = () => null
  const done = () => null
  const gridOptions = gridMapper(
    processedResult,
    legacyConfig,
    visTriggerCb,
    done
  )

  return {
    options: gridOptions,
  }
}
