// This file is automatically generated based on the Looker Core API metadata.

import { IntegrationProxyAccountIdentity } from './integration_proxy_account_identity'

export interface IntegrationProxyAccountIntegration {
  /** Operations the current user is able to perform on this object */
  can: {[key: string]: boolean}
  /** The installation type: SLACK */
  installation_type: string
  /** The name of the integration */
  name: string
  /** The description of the integration */
  description: string
  /** The url to the icon of the integration */
  icon_url: string
  /** The oauth url, this should points to the integration proxy service where we handle oauth */
  oauth_url: string | null
  /** An optional federated identity with this integration */
  identity: IntegrationProxyAccountIdentity | null
  /** Is this integration installed by an admin */
  is_installed: boolean
}

export interface RequestIntegrationProxyAccountIntegration {

}
