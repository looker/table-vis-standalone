// This file is automatically generated based on the Looker Core API metadata.

import { HomepageSection } from './homepage_section'

export interface Homepage {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Id of associated content_metadata record */
  content_metadata_id: number | null
  /** Date of homepage creatopm */
  created_at: string | null
  /** Date of homepage deletion */
  deleted_at: string | null
  /** Description of homepage */
  description: string | null
  /** Sections of the homepage */
  homepage_sections: HomepageSection[] | null
  /** Unique Id */
  id: string
  /** ids of the homepage sections in the order they should be displayed */
  section_order: number[] | null
  /** Title of homepage */
  title: string | null
  /** Date of last homepage update */
  updated_at: string | null
  /** User id of homepage creator */
  user_id: number | null
  /** Whether the homepage is the primary homepage or not */
  primary_homepage: boolean
}

export interface RequestHomepage {
  /** Date of homepage deletion */
  deleted_at?: string | null
  /** Description of homepage */
  description?: string | null
  /** ids of the homepage sections in the order they should be displayed */
  section_order?: number[] | null
  /** Title of homepage */
  title?: string | null
}
