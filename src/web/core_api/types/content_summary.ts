// This file is automatically generated based on the Looker Core API metadata.

export interface ContentSummary {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Unique id */
  id: number
  /** Content type */
  content_type: string | null
  /** Content id */
  content_id: number | null
  /** Content slug */
  content_slug: number | null
  /** Content title */
  title: string | null
  /** Content Description */
  description: string | null
  /** Last time viewed by current user */
  last_viewed_at: string | null
  /** ID of user who created the content */
  user_id: number | null
  /** Full name of user who created the content */
  user_full_name: string | null
  /** If the content is scheduled by the current user */
  is_scheduled: boolean
  /** Number of favorites */
  favorite_count: number | null
  /** Number of views */
  view_count: number | null
  favorite_id: number | null
  weighted_score: number | null
  group_weighted_score: number | null
  suggestion_score: number | null
  /** The preferred route for viewing this content (ie: dashboards or dashboards-next) */
  preferred_viewer: string | null
}

export interface RequestContentSummary {

}
