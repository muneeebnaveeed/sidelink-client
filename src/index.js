/* eslint-disable import/first */
// window.process = {};
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './custom.css';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
	<Router>
		<App />
	</Router>,
	document.getElementById('root')
);
