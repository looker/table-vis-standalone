// This file is automatically generated based on the Looker Core API metadata.

import { PrefetchAccessFilterValue, RequestPrefetchAccessFilterValue } from './prefetch_access_filter_value'

export interface PrefetchLookRequest {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Number of seconds it took to compute results for prefetch. */
  computation_time: number | null
  /** Time when prefetch was created. */
  created_at: string | null
  /** Number of times prefetch has been accessed. */
  hit_count: number | null
  /** Size of result. */
  result_size_bytes: number | null
  /** Time when prefetch was last accessed. */
  touched_at: string | null
  /** Number of seconds prefetch will live for. */
  ttl: number | null
  /** Data associated with the queries stored by prefetching the data */
  value: {[key: string]: string} | null
  /** Access filters to apply when running queries for prefetch. */
  access_filters: PrefetchAccessFilterValue[] | null
}

export interface RequestPrefetchLookRequest {
  /** Number of seconds prefetch will live for. */
  ttl?: number | null
  /** Access filters to apply when running queries for prefetch. */
  access_filters?: RequestPrefetchAccessFilterValue[] | null
}
