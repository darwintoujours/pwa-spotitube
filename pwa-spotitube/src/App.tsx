import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import UserPlaylists from "./pages/UserPlaylists";
import PlaylistDetail from "./pages/PlaylistDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomPlayer from "./components/BottomPlayer";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      {/* Barre de navigation */}
      <nav style={{
        display: "flex", gap: 24, alignItems: "center", padding: "16px 32px",
        background: "#191414", color: "#fff", marginBottom: 32
      }}>
        <Link to="/" style={{ color: "#1DB954", fontWeight: 700, fontSize: 22, textDecoration: "none" }}>Spotitube</Link>
        <Link to="/search" style={{ color: "#fff", textDecoration: "none" }}>Recherche</Link>
        <Link to="/playlists" style={{ color: "#fff", textDecoration: "none" }}>Mes Playlists</Link>
      </nav>

      <Routes>
        {/* Page de login, accessible à tous */}
        <Route path="/login" element={<Login />} />

        {/* Pages protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/playlists" element={<UserPlaylists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 40, textAlign: "center" }}>Page non trouvée</div>} />
      </Routes>

      {/* Player global, toujours visible en bas */}
      <BottomPlayer />
    </BrowserRouter>
  );
}