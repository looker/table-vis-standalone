import { GridContext } from "web/visualizations/components/Grid/types/grid_types"
import { QueryResponse } from "web/visualizations/types/query_response"
import { VisConfig } from "web/visualizations/types/vis_config"
import { preprocessQueryResponse } from "web/visualizations/components/Grid/utils/query_utils"

export const config = {
  "show_view_names": false,
  "show_row_numbers": true,
  "transpose": false,
  "truncate_text": true,
  "hide_totals": false,
  "hide_row_totals": false,
  "size_to_fit": true,
  "table_theme": "gray",
  "limit_displayed_rows": false,
  "enable_conditional_formatting": false,
  "header_text_alignment": "left",
  "header_font_size": "12",
  "rows_font_size": "12",
  "conditional_formatting_include_totals": false,
  "conditional_formatting_include_nulls": false,
  "show_sql_query_menu_options": false,
  "show_totals": true,
  "show_row_totals": true,
  "type": "looker_grid",
  "x_axis_gridlines": false,
  "y_axis_gridlines": true,
  "show_y_axis_labels": true,
  "show_y_axis_ticks": true,
  "y_axis_tick_density": "default",
  "y_axis_tick_density_custom": 5,
  "show_x_axis_label": true,
  "show_x_axis_ticks": true,
  "y_axis_scale_mode": "linear",
  "x_axis_reversed": false,
  "y_axis_reversed": false,
  "plot_size_by_field": false,
  "trellis": "",
  "stacking": "",
  "legend_position": "center",
  "point_style": "none",
  "show_value_labels": false,
  "label_density": 25,
  "x_axis_scale": "auto",
  "y_axis_combined": true,
  "ordering": "none",
  "show_null_labels": false,
  "show_totals_labels": false,
  "show_silhouette": false,
  "totals_color": "#808080",
  "defaults_version": 1,
  "series_types": {}
} as VisConfig

export const queryResponse = {
  "status": "complete",
  "from_cache": true,
  "id": "68927a65b195b0bd5008b02218c82057",
  "result_source": "query",
  "supports_pivot_in_db": true,
  "null_sort_treatment": "low",
  "expired": false,
  "ran_at": "2020-02-04T14:33:57-07:00",
  "runtime": "0.952",
  "sortS": [],
  "added_params": {
    "sorts": [
      "users.age_tier__sort_",
      "users.age_tier"
    ]
  },
  "subtotals_data": {
    "1": [
      {
        "users.age_tier": {
          "value": "10 to 19",
          "sort_value": "02"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 1062,
          "rendered": "1,062",
          "links": [
            {
              "label": "Show All 1,062",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=10+to+19&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "20 to 29",
          "sort_value": "03"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 2367,
          "rendered": "2,367",
          "links": [
            {
              "label": "Show All 2,367",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=20+to+29&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "30 to 39",
          "sort_value": "04"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 2304,
          "rendered": "2,304",
          "links": [
            {
              "label": "Show All 2,304",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=30+to+39&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "40 to 49",
          "sort_value": "05"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 2300,
          "rendered": "2,300",
          "links": [
            {
              "label": "Show All 2,300",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=40+to+49&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "50 to 59",
          "sort_value": "06"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 2217,
          "rendered": "2,217",
          "links": [
            {
              "label": "Show All 2,217",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=50+to+59&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "60 to 69",
          "sort_value": "07"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 1639,
          "rendered": "1,639",
          "links": [
            {
              "label": "Show All 1,639",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=60+to+69&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "70 to 79",
          "sort_value": "08"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 962,
          "links": [
            {
              "label": "Show All 962",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=70+to+79&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      },
      {
        "users.age_tier": {
          "value": "80 or Above",
          "sort_value": "09"
        },
        "users.gender": {
          "value": null,
          "filterable_value": "EMPTY"
        },
        "users.count": {
          "value": 647,
          "links": [
            {
              "label": "Show All 647",
              "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=80+or+Above&query_timezone=America%2FLos_Angeles&limit=500",
              "type": "measure_default"
            }
          ]
        },
        "$$$__grouping__$$$": [
          "users.age_tier"
        ]
      }
    ]
  },
  "subtotal_sets": [
    [
      "users.age_tier"
    ]
  ],
  "sql": "SELECT\n\tCASE\nWHEN users.age  < 0 THEN '00'\nWHEN users.age  >= 0 AND users.age  < 10 THEN '01'\nWHEN users.age  >= 10 AND users.age  < 20 THEN '02'\nWHEN users.age  >= 20 AND users.age  < 30 THEN '03'\nWHEN users.age  >= 30 AND users.age  < 40 THEN '04'\nWHEN users.age  >= 40 AND users.age  < 50 THEN '05'\nWHEN users.age  >= 50 AND users.age  < 60 THEN '06'\nWHEN users.age  >= 60 AND users.age  < 70 THEN '07'\nWHEN users.age  >= 70 AND users.age  < 80 THEN '08'\nWHEN users.age  >= 80 THEN '09'\nELSE '10'\nEND AS `users.age_tier__sort_`,\n\tCASE\nWHEN users.age  < 0 THEN 'Below 0'\nWHEN users.age  >= 0 AND users.age  < 10 THEN '0 to 9'\nWHEN users.age  >= 10 AND users.age  < 20 THEN '10 to 19'\nWHEN users.age  >= 20 AND users.age  < 30 THEN '20 to 29'\nWHEN users.age  >= 30 AND users.age  < 40 THEN '30 to 39'\nWHEN users.age  >= 40 AND users.age  < 50 THEN '40 to 49'\nWHEN users.age  >= 50 AND users.age  < 60 THEN '50 to 59'\nWHEN users.age  >= 60 AND users.age  < 70 THEN '60 to 69'\nWHEN users.age  >= 70 AND users.age  < 80 THEN '70 to 79'\nWHEN users.age  >= 80 THEN '80 or Above'\nELSE 'Undefined'\nEND AS `users.age_tier`,\n\tusers.gender AS `users.gender`,\n\tCOUNT(DISTINCT COALESCE(users.id, 0) ) AS `users.count`\nFROM users  AS users\n\nGROUP BY 1 ASC, 2 ASC, 3 ASC WITH ROLLUP\nLIMIT 1000",
  "sql_explain": "EXPLAIN SELECT \n\tCASE\nWHEN users.age  < 0 THEN '00'\nWHEN users.age  >= 0 AND users.age  < 10 THEN '01'\nWHEN users.age  >= 10 AND users.age  < 20 THEN '02'\nWHEN users.age  >= 20 AND users.age  < 30 THEN '03'\nWHEN users.age  >= 30 AND users.age  < 40 THEN '04'\nWHEN users.age  >= 40 AND users.age  < 50 THEN '05'\nWHEN users.age  >= 50 AND users.age  < 60 THEN '06'\nWHEN users.age  >= 60 AND users.age  < 70 THEN '07'\nWHEN users.age  >= 70 AND users.age  < 80 THEN '08'\nWHEN users.age  >= 80 THEN '09'\nELSE '10'\nEND AS `users.age_tier__sort_`,\n\tCASE\nWHEN users.age  < 0 THEN 'Below 0'\nWHEN users.age  >= 0 AND users.age  < 10 THEN '0 to 9'\nWHEN users.age  >= 10 AND users.age  < 20 THEN '10 to 19'\nWHEN users.age  >= 20 AND users.age  < 30 THEN '20 to 29'\nWHEN users.age  >= 30 AND users.age  < 40 THEN '30 to 39'\nWHEN users.age  >= 40 AND users.age  < 50 THEN '40 to 49'\nWHEN users.age  >= 50 AND users.age  < 60 THEN '50 to 59'\nWHEN users.age  >= 60 AND users.age  < 70 THEN '60 to 69'\nWHEN users.age  >= 70 AND users.age  < 80 THEN '70 to 79'\nWHEN users.age  >= 80 THEN '80 or Above'\nELSE 'Undefined'\nEND AS `users.age_tier`,\n\tusers.gender AS `users.gender`,\n\tCOUNT(DISTINCT COALESCE(users.id, 0) ) AS `users.count`\nFROM users  AS users\n\nGROUP BY 1 ASC, 2 ASC, 3 ASC WITH ROLLUP\nLIMIT 1000",
  "fields": {
    "measures": [
      {
        "align": "right",
        "can_filter": true,
        "category": "measure",
        "default_filter_value": null,
        "description": null,
        "enumerations": null,
        "field_group_label": null,
        "fill_style": null,
        "fiscal_month_offset": 0,
        "has_allowed_values": false,
        "hidden": false,
        "is_filter": false,
        "is_numeric": true,
        "label": "Users Count",
        "label_from_parameter": null,
        "label_short": "Count",
        "lookml_link": "/projects/thelook/files/users.view.lkml?line=217",
        "map_layer": null,
        "name": "users.count",
        "strict_value_format": false,
        "permanent": null,
        "requires_refresh_on_sort": false,
        "sortable": true,
        "suggestions": null,
        "tags": [],
        "type": "count_distinct",
        "user_attribute_filter_types": [
          "number",
          "advanced_filter_number"
        ],
        "value_format": null,
        "view": "users",
        "view_label": "Users",
        "dynamic": false,
        "week_start_day": "monday",
        "error": null,
        "field_group_variant": "Count",
        "measure": true,
        "parameter": false,
        "primary_key": false,
        "project_name": "thelook",
        "scope": "users",
        "source_file": "users.view.lkml",
        "source_file_path": "thelook/users.view.lkml",
        "suggest_dimension": "users.count",
        "suggest_explore": "users",
        "suggestable": false,
        "is_fiscal": false,
        "is_timeframe": false,
        "is_turtle": false,
        "can_turtle": false,
        "turtle_dimension": null,
        "can_time_filter": false,
        "time_interval": null,
        "sql": null,
        "sql_case": null
      }
    ],
    "dimensions": [
      {
        "align": "left",
        "can_filter": true,
        "category": "dimension",
        "default_filter_value": null,
        "description": "It's like age but it makes you cry. Sometimes it can last a really long time, such as this extremely long message",
        "enumerations": [
          {
            "label": "Below 0",
            "value": "Below 0"
          },
          {
            "label": "0 to 9",
            "value": "0 to 9"
          },
          {
            "label": "10 to 19",
            "value": "10 to 19"
          },
          {
            "label": "20 to 29",
            "value": "20 to 29"
          },
          {
            "label": "30 to 39",
            "value": "30 to 39"
          },
          {
            "label": "40 to 49",
            "value": "40 to 49"
          },
          {
            "label": "50 to 59",
            "value": "50 to 59"
          },
          {
            "label": "60 to 69",
            "value": "60 to 69"
          },
          {
            "label": "70 to 79",
            "value": "70 to 79"
          },
          {
            "label": "80 or Above",
            "value": "80 or Above"
          },
          {
            "label": "Undefined",
            "value": "Undefined"
          }
        ],
        "field_group_label": null,
        "fill_style": "enumeration",
        "fiscal_month_offset": 0,
        "has_allowed_values": false,
        "hidden": false,
        "is_filter": false,
        "is_numeric": false,
        "label": "Users Age Tier",
        "label_from_parameter": null,
        "label_short": "Age Tier",
        "lookml_link": "/projects/thelook/files/users.view.lkml?line=33",
        "map_layer": null,
        "name": "users.age_tier",
        "strict_value_format": false,
        "permanent": null,
        "requires_refresh_on_sort": false,
        "sortable": true,
        "suggestions": [
          "Below 0",
          "0 to 9",
          "10 to 19",
          "20 to 29",
          "30 to 39",
          "40 to 49",
          "50 to 59",
          "60 to 69",
          "70 to 79",
          "80 or Above",
          "Undefined"
        ],
        "tags": [],
        "type": "tier",
        "user_attribute_filter_types": [
          "string",
          "advanced_filter_string"
        ],
        "value_format": null,
        "view": "users",
        "view_label": "Users",
        "dynamic": false,
        "week_start_day": "monday",
        "error": null,
        "field_group_variant": "Age Tier",
        "measure": false,
        "parameter": false,
        "primary_key": false,
        "project_name": "thelook",
        "scope": "users",
        "source_file": "users.view.lkml",
        "source_file_path": "thelook/users.view.lkml",
        "suggest_dimension": "users.age_tier",
        "suggest_explore": "users",
        "suggestable": true,
        "is_fiscal": false,
        "is_timeframe": false,
        "is_turtle": false,
        "can_turtle": false,
        "turtle_dimension": null,
        "can_time_filter": false,
        "time_interval": null,
        "sql": null,
        "sql_case": null,
        "sorted": {
          "sort_index": 1,
          "desc": false
        }
      },
      {
        "align": "left",
        "can_filter": true,
        "category": "dimension",
        "default_filter_value": null,
        "description": null,
        "enumerations": null,
        "field_group_label": null,
        "fill_style": null,
        "fiscal_month_offset": 0,
        "has_allowed_values": false,
        "hidden": false,
        "is_filter": false,
        "is_numeric": false,
        "label": "Users Gender",
        "label_from_parameter": null,
        "label_short": "Gender",
        "lookml_link": "/projects/thelook/files/users.view.lkml?line=148",
        "map_layer": null,
        "name": "users.gender",
        "strict_value_format": false,
        "permanent": null,
        "requires_refresh_on_sort": false,
        "sortable": true,
        "suggestions": null,
        "tags": [],
        "type": "string",
        "user_attribute_filter_types": [
          "string",
          "advanced_filter_string"
        ],
        "value_format": null,
        "view": "users",
        "view_label": "Users",
        "dynamic": false,
        "week_start_day": "monday",
        "error": null,
        "field_group_variant": "Gender",
        "measure": false,
        "parameter": false,
        "primary_key": false,
        "project_name": "thelook",
        "scope": "users",
        "source_file": "users.view.lkml",
        "source_file_path": "thelook/users.view.lkml",
        "suggest_dimension": "users.gender",
        "suggest_explore": "users",
        "suggestable": true,
        "is_fiscal": false,
        "is_timeframe": false,
        "is_turtle": false,
        "can_turtle": false,
        "turtle_dimension": null,
        "can_time_filter": false,
        "time_interval": null,
        "sql": null,
        "sql_case": null
      }
    ],
    "table_calculations": [],
    "pivots": []
  },
  "fill_fields": [],
  "has_totals": false,
  "has_row_totals": false,
  "applied_filters": {},
  "applied_filter_expression": null,
  "number_format": "1,234.56",
  "explore": {
    "name": "users",
    "label": "Users",
    "description": null
  },
  "timezone": "America/Los_Angeles",
  "data": [
    {
      "users.age_tier": {
        "value": "10 to 19",
        "sort_value": "02"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 530,
        "links": [
          {
            "label": "Show All 530",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=10+to+19&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "10 to 19",
        "sort_value": "02"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 532,
        "links": [
          {
            "label": "Show All 532",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=10+to+19&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "20 to 29",
        "sort_value": "03"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 1169,
        "rendered": "1,169",
        "links": [
          {
            "label": "Show All 1,169",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=20+to+29&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "20 to 29",
        "sort_value": "03"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 1198,
        "rendered": "1,198",
        "links": [
          {
            "label": "Show All 1,198",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=20+to+29&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "30 to 39",
        "sort_value": "04"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 1148,
        "rendered": "1,148",
        "links": [
          {
            "label": "Show All 1,148",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=30+to+39&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "30 to 39",
        "sort_value": "04"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 1156,
        "rendered": "1,156",
        "links": [
          {
            "label": "Show All 1,156",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=30+to+39&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "40 to 49",
        "sort_value": "05"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 1144,
        "rendered": "1,144",
        "links": [
          {
            "label": "Show All 1,144",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=40+to+49&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "40 to 49",
        "sort_value": "05"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 1156,
        "rendered": "1,156",
        "links": [
          {
            "label": "Show All 1,156",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=40+to+49&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "50 to 59",
        "sort_value": "06"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 1106,
        "rendered": "1,106",
        "links": [
          {
            "label": "Show All 1,106",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=50+to+59&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "50 to 59",
        "sort_value": "06"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 1111,
        "rendered": "1,111",
        "links": [
          {
            "label": "Show All 1,111",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=50+to+59&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "60 to 69",
        "sort_value": "07"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 825,
        "links": [
          {
            "label": "Show All 825",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=60+to+69&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "60 to 69",
        "sort_value": "07"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 814,
        "links": [
          {
            "label": "Show All 814",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=60+to+69&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "70 to 79",
        "sort_value": "08"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 445,
        "links": [
          {
            "label": "Show All 445",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=70+to+79&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "70 to 79",
        "sort_value": "08"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 517,
        "links": [
          {
            "label": "Show All 517",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=70+to+79&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "80 or Above",
        "sort_value": "09"
      },
      "users.gender": {
        "value": "f"
      },
      "users.count": {
        "value": 337,
        "links": [
          {
            "label": "Show All 337",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=80+or+Above&f[users.gender]=f&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    },
    {
      "users.age_tier": {
        "value": "80 or Above",
        "sort_value": "09"
      },
      "users.gender": {
        "value": "m"
      },
      "users.count": {
        "value": 310,
        "links": [
          {
            "label": "Show All 310",
            "url": "/explore/thelook/users?fields=users.id,users.name,users.email,users.city,users.state,users.country,users.zipcode,users.gender,users.age&f[users.age_tier]=80+or+Above&f[users.gender]=m&query_timezone=America%2FLos_Angeles&limit=500",
            "type": "measure_default"
          }
        ]
      }
    }
  ],
  "drill_menu_build_time": 0.08551399999999999,
  "has_subtotals": false
} as unknown as QueryResponse

export const overlay = false

export const done = ()=> false

export const triggerCb = ()=> false

export const context = {
  config,
  queryResponse: preprocessQueryResponse(queryResponse, config),
  overlay,
  done,
  triggerCb,
} as GridContext