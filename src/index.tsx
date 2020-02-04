import 'web/visualizations/components/Grid/styles/grid_themes.scss'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Grid from 'web/visualizations/components/Grid';
import { context } from './example_data';


ReactDOM.render(<Grid options={context} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
