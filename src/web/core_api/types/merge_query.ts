// This file is automatically generated based on the Looker Core API metadata.

import { MergeQuerySourceQuery, RequestMergeQuerySourceQuery } from './merge_query_source_query'

export interface MergeQuery {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Column Limit */
  column_limit: string | null
  /** Dynamic Fields */
  dynamic_fields: string | null
  /** Unique Id */
  id: string
  /** Pivots */
  pivots: string[] | null
  /** Unique to get results */
  result_maker_id: number | null
  /** Sorts */
  sorts: string[] | null
  /** Source Queries defining the results to be merged. */
  source_queries: MergeQuerySourceQuery[] | null
  /** Total */
  total: boolean
  /** Visualization Config */
  vis_config: {[key: string]: string} | null
}

export interface RequestMergeQuery {
  /** Column Limit */
  column_limit?: string | null
  /** Dynamic Fields */
  dynamic_fields?: string | null
  /** Pivots */
  pivots?: string[] | null
  /** Sorts */
  sorts?: string[] | null
  /** Source Queries defining the results to be merged. */
  source_queries?: RequestMergeQuerySourceQuery[] | null
  /** Total */
  total?: boolean
  /** Visualization Config */
  vis_config?: {[key: string]: string} | null
}
