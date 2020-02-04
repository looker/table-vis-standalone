// This file is automatically generated based on the Looker Core API metadata.

export interface UserAttribute {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Unique Id */
  id: number
  /** Name of user attribute */
  name: string | null
  /** Human-friendly label for user attribute */
  label: string | null
  /** Type of user attribute ("string", "number", "datetime", "yesno", "zipcode") */
  type: string | null
  /** Default value for when no value is set on the user */
  default_value: string | null
  /** Attribute is a system default */
  is_system: boolean
  /** Attribute is permanent and cannot be deleted */
  is_permanent: boolean
  /** If true, users will not be able to view values of this attribute */
  value_is_hidden: boolean
  /** Non-admin users can see the values of their attributes and use them in filters */
  user_can_view: boolean
  /** Users can change the value of this attribute for themselves */
  user_can_edit: boolean
  /** Destinations to which a hidden attribute may be sent. Once set, cannot be edited. */
  hidden_value_domain_whitelist: string | null
}

export interface RequestUserAttribute {
  /** Name of user attribute */
  name?: string | null
  /** Human-friendly label for user attribute */
  label?: string | null
  /** Type of user attribute ("string", "number", "datetime", "yesno", "zipcode") */
  type?: string | null
  /** Default value for when no value is set on the user */
  default_value?: string | null
  /** If true, users will not be able to view values of this attribute */
  value_is_hidden?: boolean
  /** Non-admin users can see the values of their attributes and use them in filters */
  user_can_view?: boolean
  /** Users can change the value of this attribute for themselves */
  user_can_edit?: boolean
  /** Destinations to which a hidden attribute may be sent. Once set, cannot be edited. */
  hidden_value_domain_whitelist?: string | null
}
