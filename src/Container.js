import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import {App} from './App';
import {Second} from './second'

export default class Container extends Component {
    render(){
        return(
        <Router >
            <div>
                <ul>
                    <li><Link to="/">First Method</Link></li>
                    <li><Link to="/second">Second Method</Link></li>                
                </ul>                
                <Route path="/" component={App}/>
                <Route path="/second" component={Second}/>                
            </div>
        </Router>)
    }
}