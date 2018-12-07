import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';

import Chat from './components/Chat';

// import logo from './logo.svg';
import './App.css';

Sentry.init({
 dsn: "https://19483dd454cd45849bdde4ce2763a1bc@sentry.io/1339453"
});

class App extends Component {
  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    return (
      <div className="App">
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Chat</h1>
        </header> */}
        <div className="App-main">
          <Chat />
        </div>
      </div>
    );
  }
}

export default App;
