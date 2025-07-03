import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEnsureSpotifyToken } from "../hooks/useEnsureSpotifyToken";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEnsureSpotifyToken(); // Vérifie et rafraîchit le token Spotify

  if (loading) return <div>Chargement...</div>;

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}