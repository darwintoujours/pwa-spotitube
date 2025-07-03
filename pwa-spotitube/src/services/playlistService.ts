import { supabase } from '../supabaseClient';

// Récupérer toutes les playlists d’un utilisateur
export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from("playlists")
    .select()
    .eq("userid", userId)
    .order("createdat", { ascending: false });
  if (error) throw error;
  return data;
}

// Créer une nouvelle playlist
export async function createPlaylist(userId: string, name: string) {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ userid: userId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Renommer une playlist
export async function renamePlaylist(playlistId: string, newName: string) {
  const { error } = await supabase
    .from("playlists")
    .update({ name: newName })
    .eq("id", playlistId);
  if (error) throw error;
}

// Supprimer une playlist
export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId);
  if (error) throw error;
}