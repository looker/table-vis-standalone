// This file is automatically generated based on the Looker Core API metadata.

import { ResultMakerFilterablesListen } from './result_maker_filterables_listen'

export interface ResultMakerFilterables {
  /** The model this filterable comes from (used for field suggestions). */
  model: string | null
  /** The view this filterable comes from (used for field suggestions). */
  view: string | null
  /** The name of the filterable thing (Query or Merged Results). */
  name: string | null
  /** array of dashboard_filter_name: and field: objects. */
  listen: ResultMakerFilterablesListen[] | null
}

export interface RequestResultMakerFilterables {

}
