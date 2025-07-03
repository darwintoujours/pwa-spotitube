import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEnsureSpotifyToken } from "../hooks/useEnsureSpotifyToken";

export default function ProtectedRoute() {
  // Récupère l’utilisateur Supabase (null si non connecté)
  const { user } = useAuth();

  // Lance la logique de refresh automatique du token Spotify à chaque affichage de route protégée
  useEnsureSpotifyToken();

  // Garde la route demandée pour rediriger après login si besoin
  const location = useLocation();

  // Si l’utilisateur n’est pas connecté, redirige vers /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si connecté, affiche les routes enfants
  return <Outlet />;
}