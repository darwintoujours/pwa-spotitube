import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEnsureSpotifyToken } from "../hooks/useEnsureSpotifyToken"; // Si tu utilises ce hook

export default function ProtectedRoute() {
  useEnsureSpotifyToken();
  const { user, loading } = useAuth();
  const location = useLocation();

  // (Optionnel) S'assure que le token Spotify est valide sur toutes les pages protégées
  useEnsureSpotifyToken?.();

  if (loading) return <div>Chargement...</div>;

  // Si pas connecté, redirige vers /login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Sinon, affiche la page protégée
  return <Outlet />;
}