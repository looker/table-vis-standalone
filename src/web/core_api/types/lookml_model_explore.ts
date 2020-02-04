// This file is automatically generated based on the Looker Core API metadata.

import { LookmlModelExploreAccessFilter } from './lookml_model_explore_access_filter'
import { LookmlModelExploreAlias } from './lookml_model_explore_alias'
import { LookmlModelExploreAlwaysFilter } from './lookml_model_explore_always_filter'
import { LookmlModelExploreConditionallyFilter } from './lookml_model_explore_conditionally_filter'
import { LookmlModelExploreError } from './lookml_model_explore_error'
import { LookmlModelExploreFieldset } from './lookml_model_explore_fieldset'
import { LookmlModelExploreJoins } from './lookml_model_explore_joins'
import { LookmlModelExploreSet } from './lookml_model_explore_set'
import { LookmlModelExploreSupportedMeasureType } from './lookml_model_explore_supported_measure_type'

export interface LookmlModelExplore {
  /** Fully qualified name model plus explore name */
  id: string
  /** Explore name */
  name: string | null
  /** Description */
  description: string
  /** Label */
  label: string | null
  /** Scopes */
  scopes: string[] | null
  /** Can Total */
  can_total: boolean
  /** Can Save */
  can_save: boolean
  /** Can Explain */
  can_explain: boolean
  /** Can pivot in the DB */
  can_pivot_in_db: boolean
  /** Can use subtotals */
  can_subtotal: boolean
  /** Has timezone support */
  has_timezone_support: boolean
  /** Cost estimates supported */
  supports_cost_estimate: boolean
  /** Connection name */
  connection_name: string | null
  /** How nulls are sorted, possible values are "low", "high", "first" and "last" */
  null_sort_treatment: string | null
  /** List of model source files */
  files: string[] | null
  /** Primary source_file file */
  source_file: string | null
  /** Name of project */
  project_name: string | null
  /** Name of model */
  model_name: string | null
  /** Name of view */
  view_name: string | null
  /** Is hidden */
  hidden: boolean
  /** A sql_table_name expression that defines what sql table the view/explore maps onto. Example: "prod_orders2 AS orders" in a view named orders. */
  sql_table_name: string | null
  /** Access filters */
  access_filters: LookmlModelExploreAccessFilter[] | null
  /** Aliases */
  aliases: LookmlModelExploreAlias[] | null
  /** Always filter */
  always_filter: LookmlModelExploreAlwaysFilter[] | null
  /** Conditionally filter */
  conditionally_filter: LookmlModelExploreConditionallyFilter[] | null
  /** Array of index fields */
  index_fields: string[] | null
  /** Sets */
  sets: LookmlModelExploreSet[] | null
  /** An array of arbitrary string tags provided in the model for this explore. */
  tags: string[] | null
  /** Errors */
  errors: LookmlModelExploreError[] | null
  /** Fields */
  fields: LookmlModelExploreFieldset | null
  /** Views joined into this explore */
  joins: LookmlModelExploreJoins[] | null
  /** Label used to group explores in the navigation menus */
  group_label: string | null
  /** An array of items describing which custom measure types are supported for creating a custom measure 'baed_on' each possible dimension type. */
  supported_measure_types: LookmlModelExploreSupportedMeasureType[]
  /** (Undocumented, internal-only): queries that are "turtles". */
  turtle_looks: string[] | null
}

export interface RequestLookmlModelExplore {

}
