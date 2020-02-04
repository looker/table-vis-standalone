// This file is automatically generated based on the Looker Core API metadata.

export interface AccessFilter {
  /** ID of this AccessFilter */
  id: number
  /** Model to which this filter applies */
  model: string | null
  /** Field to which this filter applies */
  field: string | null
  /** Value for this filter */
  value: string | null
  /** Link to get this item */
  url: string | null
}

export interface RequestAccessFilter {
  /** Model to which this filter applies */
  model?: string | null
  /** Field to which this filter applies */
  field?: string | null
  /** Value for this filter */
  value?: string | null
}
