import React, { createContext, useContext, useState } from "react";

type SpotifyTokenContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

const SpotifyTokenContext = createContext<SpotifyTokenContextType | undefined>(undefined);

export const SpotifyTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <SpotifyTokenContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </SpotifyTokenContext.Provider>
  );
};

export function useSpotifyToken() {
  const ctx = useContext(SpotifyTokenContext);
  if (!ctx) throw new Error("useSpotifyToken must be used within SpotifyTokenProvider");
  return ctx;
}