import { supabase } from '../supabaseClient';

// Ajouter un morceau à une playlist
export async function addTrackToPlaylist({
  playlist_id,
  title,
  artist,
  source,
  source_id,
  album,
  album_art,
}: {
  playlist_id: string;
  title: string;
  artist: string;
  source: string;      // 'spotify' ou 'youtube'
  source_id: string;   // id Spotify ou id YouTube
  album?: string;
  album_art?: string;
}) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert([
      { playlist_id, title, artist, source, source_id, album, album_art }
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Récupérer tous les morceaux d'une playlist
export async function getTracksForPlaylist(playlist_id: string) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('*')
    .eq('playlist_id', playlist_id)
    .order('added_at', { ascending: true });
  if (error) throw error;
  return data;
}

// Supprimer un morceau d'une playlist
export async function deleteTrackFromPlaylist(track_id: string) {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('id', track_id);
  if (error) throw error;
}

// Dans src/services/playlistTracksService.ts
export async function updateTrackPosition(track_id: string, position: number) {
  const { error } = await supabase
    .from('playlist_tracks')
    .update({ position })
    .eq('id', track_id);
  if (error) throw error;
}