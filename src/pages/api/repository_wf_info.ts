import { supabase } from './db_client';

export const getAllRepositories = async () => {
  const { data, error } = await supabase
    .from('repository_wf_info')
    .select('*');

  if (error) {
    console.error('Error fetching all repositories:', error.message);
    throw error;
  }

  return data;
}