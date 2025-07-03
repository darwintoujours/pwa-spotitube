import { supabase } from "../supabaseClient";

// Ajouter un morceau à une playlist
export async function addTrackToPlaylist({
  playlistid,
  title,
  artist,
  source,
  sourceid,
  album,
  albumart,
}: {
  playlistid: string;
  title: string;
  artist: string;
  source: string; // "spotify" ou "youtube"
  sourceid: string; // id Spotify ou id YouTube
  album?: string;
  albumart?: string;
}) {
  const { data, error } = await supabase
    .from("playlisttracks")
    .insert({ playlistid, title, artist, source, sourceid, album, albumart })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Récupérer tous les morceaux d'une playlist
export async function getTracksForPlaylist(playlistid: string) {
  const { data, error } = await supabase
    .from("playlisttracks")
    .select()
    .eq("playlistid", playlistid)
    .order("position", { ascending: true }); // ou "addedat"
  if (error) throw error;
  return data;
}

// Supprimer un morceau d'une playlist
export async function deleteTrackFromPlaylist(trackid: string) {
  const { error } = await supabase
    .from("playlisttracks")
    .delete()
    .eq("id", trackid);
  if (error) throw error;
}

// Mettre à jour la position d'un morceau (pour drag & drop)
export async function updateTrackPosition(trackid: string, position: number) {
  const { error } = await supabase
    .from("playlisttracks")
    .update({ position })
    .eq("id", trackid);
  if (error) throw error;
}
