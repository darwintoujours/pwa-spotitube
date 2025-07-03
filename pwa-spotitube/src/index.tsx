import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { SpotifyTokenProvider } from "./contexts/SpotifyTokenContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <PlayerProvider>
      <SpotifyTokenProvider>
        <App />
      </SpotifyTokenProvider>
    </PlayerProvider>
  </AuthProvider>
);