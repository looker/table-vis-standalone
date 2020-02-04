// This file is automatically generated based on the Looker Core API metadata.

export interface LabsFeature {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  id: string
  name: string | null
  description: string | null
  documentation_url: string | null
  category: string | null
  type: string | null
  value: string | null
}

export interface RequestLabsFeature {
  value?: string | null
}
