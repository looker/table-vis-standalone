import { QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import { preprocessQueryResponse } from 'web/visualizations/components/Grid/utils/query_utils'
import { gridMapper } from '../mappers/grid_mapper'
import '../styles/grid_themes.scss'
import { GridProps } from '../Grid'

export const gridAdapter = (config: VisConfig, result: QueryResponse) => {
  const processedResult = preprocessQueryResponse(result, config)
  if (!processedResult) return {} as GridProps

  const visTriggerCb = () => null
  const done = () => null
  const gridOptions = gridMapper(processedResult, config, visTriggerCb, done)

  return {
    options: gridOptions,
  } as GridProps
}
