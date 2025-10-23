import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

export const wf_repositories_data = {
  getAllWfRepositoriesData: defineAction({
    handler: async () => {
      console.log('Fetching all repositories data from wf_repositories_data table');
      const { data, error } = await supabase
        .from('wf_repositories_data')
        .select('*');
      if (error) {
        console.error('Error fetching repositories data:', error.message);
        return [];
      }
      return data;
    }
  })
}