// This file is automatically generated based on the Looker Core API metadata.

import { EmbedSecret } from './embed_secret'

export interface EmbedConfig {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** List of domains to whitelist for embedding */
  domain_whitelist: string[] | null
  /** Default embed domain. */
  default_domain: string | null
  /** Array of embed secrets */
  secrets: EmbedSecret[] | null
  /** Is SSO embedding enabled for this Looker */
  sso_auth_enabled: boolean
  /** When true, prohibits the use of Looker login pages in non-Looker iframes. When false, Looker login pages may be used in non-Looker hosted iframes. */
  strict_sameorigin_for_login: boolean
}

export interface RequestEmbedConfig {
  /** List of domains to whitelist for embedding */
  domain_whitelist?: string[] | null
  /** Default embed domain. */
  default_domain?: string | null
  /** Is SSO embedding enabled for this Looker */
  sso_auth_enabled?: boolean
  /** When true, prohibits the use of Looker login pages in non-Looker iframes. When false, Looker login pages may be used in non-Looker hosted iframes. */
  strict_sameorigin_for_login?: boolean
}
