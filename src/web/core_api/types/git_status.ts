// This file is automatically generated based on the Looker Core API metadata.

export interface GitStatus {
  /** Git action: add, delete, etc */
  action: string | null
  /** When true, changes to the local file conflict with the remote repository */
  conflict: boolean
  /** When true, the file can be reverted to an earlier state */
  revertable: boolean
  /** Git description of the action */
  text: string | null
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
}

export interface RequestGitStatus {

}
