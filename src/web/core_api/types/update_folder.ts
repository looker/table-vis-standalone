// This file is automatically generated based on the Looker Core API metadata.

export interface UpdateFolder {
  /** Unique Name */
  name: string
  /** Id of Parent. If the parent id is null, this is a root-level entry */
  parent_id: string
}

export interface RequestUpdateFolder {
  /** Unique Name */
  name?: string
  /** Id of Parent. If the parent id is null, this is a root-level entry */
  parent_id?: string
}
