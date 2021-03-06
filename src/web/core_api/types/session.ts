// This file is automatically generated based on the Looker Core API metadata.

export interface Session {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** Unique Id */
  id: number
  /** IP address of user when this session was initiated */
  ip_address: string | null
  /** User's browser type */
  browser: string | null
  /** User's Operating System */
  operating_system: string | null
  /** City component of user location (derived from IP address) */
  city: string | null
  /** State component of user location (derived from IP address) */
  state: string | null
  /** Country component of user location (derived from IP address) */
  country: string | null
  /** Type of credentials used for logging in this session */
  credentials_type: string | null
  /** Time when this session was last extended by the user */
  extended_at: string | null
  /** Number of times this session was extended */
  extended_count: number | null
  /** Actual user in the case when this session represents one user sudo'ing as another */
  sudo_user_id: number | null
  /** Time when this session was initiated */
  created_at: string | null
  /** Time when this session will expire */
  expires_at: string | null
  /** Link to get this item */
  url: string | null
}

export interface RequestSession {

}
