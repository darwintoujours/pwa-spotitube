import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEnsureSpotifyToken } from "../hooks/useEnsureSpotifyToken";

export default function ProtectedRoute() {
  // Récupère l’utilisateur Supabase (null si non connecté)
  const { user } = useAuth();

  // Assure que le token Spotify est toujours valide et rafraîchi si nécessaire
  useEnsureSpotifyToken();

  // Mémoire de la route demandée pour redirection après login éventuel
  const location = useLocation();

  // Si l’utilisateur n’est pas connecté, redirection vers /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Sinon, affiche les routes enfants
  return <Outlet />;
}