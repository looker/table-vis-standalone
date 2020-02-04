import { AddFilterJSON, DrillMenuItem, Link } from './query_response'

export interface VisualizationClickData {
  event: {
    pageX?: number
    pageY?: number
    target?: EventTarget | null
    preventDefault?: () => void
  }
  addFilterJson?: AddFilterJSON
  links?: DrillMenuItem[]
  element?: any // JQuery<EventTarget> TODO
}

export type VisualizationOnClickHandler = (
  options: VisualizationClickData
) => void

export type VisAdapterOnClickHandler = (options: {
  element?: any // JQuery<EventTarget> TODO
  event: Event
  addFilterJson?: AddFilterJSON
  links?: Link[]
  context?: any
}) => void
