// This file is automatically generated based on the Looker Core API metadata.

export interface DataApp {
  id: string
  label: string | null
  js_url: string | null
  css_url: string | null
  is_extension: boolean
  path: string
  /** An arbitrary string that any user of data app can read and write to, to allow the app to share state. */
  context: string | null
}

export interface RequestDataApp {
  /** An arbitrary string that any user of data app can read and write to, to allow the app to share state. */
  context?: string | null
}
