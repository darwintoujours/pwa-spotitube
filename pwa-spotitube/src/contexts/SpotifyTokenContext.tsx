// src/contexts/SpotifyTokenContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { refreshSpotifyToken } from "../services/spotifyTokenService";

type SpotifyTokenContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

const SpotifyTokenContext = createContext<SpotifyTokenContextType | undefined>(undefined);

export const SpotifyTokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // initialisation + planification du rafraîchissement
    // (voir code complet fourni précédemment)
  }, []);

  return (
    <SpotifyTokenContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </SpotifyTokenContext.Provider>
  );
};

export function useSpotifyToken(): SpotifyTokenContextType {
  const ctx = useContext(SpotifyTokenContext);
  if (!ctx) throw new Error("useSpotifyToken must be used within SpotifyTokenProvider");
  return ctx;
}