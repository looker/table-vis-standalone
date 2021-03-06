// This file is automatically generated based on the Looker Core API metadata.

export interface SpaceBase {
  /** Unique Name */
  name: string
  /** Id of Parent. If the parent id is null, this is a root-level entry */
  parent_id: string | null
  /** Unique Id */
  id: string
  /** Id of content metadata */
  content_metadata_id: number | null
  /** Time the space was created */
  created_at: string | null
  /** User Id of Creator */
  creator_id: number | null
  /** Children Count */
  child_count: number | null
  /** Embedder's Id if this space was autogenerated as an embedding shared space via 'external_group_id' in an SSO embed login */
  external_id: string | null
  /** Space is an embed space */
  is_embed: boolean
  /** Space is the root embed shared space */
  is_embed_shared_root: boolean
  /** Space is the root embed users space */
  is_embed_users_root: boolean
  /** Space is a user's personal space */
  is_personal: boolean
  /** Space is descendant of a user's personal space */
  is_personal_descendant: boolean
  /** Space is the root shared space */
  is_shared_root: boolean
  /** Space is the root user space */
  is_users_root: boolean
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
}

export interface RequestSpaceBase {
  /** Unique Name */
  name?: string
  /** Id of Parent. If the parent id is null, this is a root-level entry */
  parent_id?: string | null
}
