import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import SearchPage from './pages/SearchPage';
import UserPlaylists from './pages/UserPlaylists';
import PlaylistUserDetail from './pages/PlaylistUserDetail';
import BottomPlayer from "./components/BottomPlayer";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/user-playlists" element={<UserPlaylists />} />
          <Route path="/user-playlists/:id" element={<PlaylistUserDetail />} />
        </Route>
      </Routes>
      <BottomPlayer />
    </BrowserRouter>
  );
}
