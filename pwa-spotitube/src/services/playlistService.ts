import { supabase } from '../supabaseClient';

export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPlaylist(userId: string, name: string) {
  const { data, error } = await supabase
    .from('playlists')
    .insert([{ user_id: userId, name }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renamePlaylist(playlistId: string, newName: string) {
  const { error } = await supabase
    .from('playlists')
    .update({ name: newName })
    .eq('id', playlistId);
  if (error) throw error;
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);
  if (error) throw error;
}
