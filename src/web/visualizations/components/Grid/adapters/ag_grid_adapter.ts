import { QueryResponse } from 'web/visualizations/types/query_response'
import { VisConfig } from 'web/visualizations/types/vis_config'
import { preprocessQueryResponse } from 'web/visualizations/components/Grid/utils/query_utils'
import { gridMapper } from '../mappers/grid_mapper'
import '../styles/grid_themes.scss'
import { GridProps } from '../Grid'
import { GridOptionsWrapper } from '../mappers/grid_mapper'
import { GridContext } from '../types/grid_types'
import { CustomHeader } from '../components/CustomHeader'
import { CustomHeaderGroup } from '../components/CustomHeaderGroup'
import { CustomPinnedRowRenderer } from '../components/CustomPinnedRowRenderer'
import { CustomDisplayCellText } from '../components/CustomDisplayCellText'
import { LicenseManager as USSEnterprise } from 'ag-grid-enterprise'

const GRID_LICENSE_KEY = 'Looker_Looker_4Devs_3000Deployment_24_April_2020__MTU4NzY4MjgwMDAwMA==8f57ce06db59e1e0876c5a8db417ec12'
USSEnterprise.setLicenseKey(GRID_LICENSE_KEY)

const frameworkComponents = {
  agColumnHeader: CustomHeader,
  agColumnGroupHeader: CustomHeaderGroup,
  totalsDataRowRenderer: CustomPinnedRowRenderer,
  displayCellText: CustomDisplayCellText,
}

export const agGridAdapter = (config: VisConfig, result: QueryResponse) => {
  const processedResult = preprocessQueryResponse(result, config)
  if (!processedResult) return {} as GridProps

  const visTriggerCb = () => null
  const done = () => null

  const options = { config, queryResponse: processedResult, triggerCb: visTriggerCb, overlay: false, done} as GridContext
  const gridOptionsWrapper = new GridOptionsWrapper(options)

  return {
    gridOptions: gridOptionsWrapper.buildGridOptions(),
    frameworkComponents,
    reactNext: true,
  }
}
