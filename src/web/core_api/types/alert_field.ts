// This file is automatically generated based on the Looker Core API metadata.

import { AlertFieldFilter, RequestAlertFieldFilter } from './alert_field_filter'

export interface AlertField {
  /** Field's title */
  title: string
  /** Field's name */
  name: string
  /** Field's filter */
  filter: AlertFieldFilter[] | null
}

export interface RequestAlertField {
  /** Field's title */
  title?: string
  /** Field's name */
  name?: string
  /** Field's filter */
  filter?: RequestAlertFieldFilter[] | null
}
