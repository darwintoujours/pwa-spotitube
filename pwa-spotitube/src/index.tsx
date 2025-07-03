import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { PlayerProvider } from "./contexts/PlayerContext";
import { AuthProvider } from './contexts/AuthContext';
import { SpotifyTokenProvider } from "./contexts/SpotifyTokenContext";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <AuthProvider>
      <PlayerProvider>
        <SpotifyTokenProvider>
          <App />
        </SpotifyTokenProvider>
      </PlayerProvider>
    </AuthProvider>
 //  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
