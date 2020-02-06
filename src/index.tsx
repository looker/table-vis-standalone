import 'web/visualizations/components/Grid/styles/grid_themes.scss'
import 'web/visualizations/components/Grid/styles/lk-icons.scss'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { config, queryResponse } from './example_data';
import { agGridAdapter } from 'web/visualizations/components/Grid/adapters/ag_grid_adapter';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { ThemeProvider } from 'styled-components';
import { theme } from '@looker/components';

const adapter = agGridAdapter(config, queryResponse)
const rootEl = document.getElementById('root')
rootEl?.classList.add("ag-theme-gray")
ReactDOM.render((
      <ThemeProvider theme={theme}>
        <AgGridReact {...adapter} />
      </ThemeProvider>
  ), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
