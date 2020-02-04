### Grid Styling

Grid styles rely heavily on SASS mixins.
Most styles inherit from the ag-grid style balham and the looker style white for consistency.
![grid_themes.scss](./grid_themes.scss) is your entry point, all new themes should be declared here.
In a new folder, your theme should have two basic componenets:

- A Mixin: This can be as simple or complex as you need. See the gray theme for simple or classic for more complex. If possible, try to mixin existing themes like balham and white if your theme just changes some colors. The principle (DRY) is to minimize the number of changes to make to keep all of the styles consistent.
- Variable Overrides: This file is reserved for overriding theme variables for the theme you are modifying. To find a list of the available variables, try looking at the base theme, examples: ![common vars](./common_vars.scss) or ![balham](./node_modules/ag-grid-community/src/styles/ag-theme-balham/vars/_ag-theme-balham-vars.scss) which itself inherits from ![ag-theme-base](./node_modules/ag-grid-community/src/styles/ag-theme-base/vars/_ag-theme-base-vars.scss)
