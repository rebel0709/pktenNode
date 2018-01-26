import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import Container from './Container';
import registerServiceWorker from './registerServiceWorker';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Container />, document.getElementById('root'));
registerServiceWorker();
