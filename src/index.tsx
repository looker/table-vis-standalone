import 'web/visualizations/components/Grid/styles/grid_themes.scss'
import 'web/visualizations/components/Grid/styles/lk-icons.scss'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Grid from 'web/visualizations/components/Grid';
import { config, queryResponse } from './example_data';
import { gridAdapter } from 'web/visualizations/components/Grid/adapters/grid_adapter';

const adapter = gridAdapter(config, queryResponse)

ReactDOM.render(<Grid {...adapter} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
