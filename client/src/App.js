import React, { Component } from 'react';
import Chat from './components/Chat';

// import logo from './logo.svg';
import './App.css';

class App extends Component {
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
