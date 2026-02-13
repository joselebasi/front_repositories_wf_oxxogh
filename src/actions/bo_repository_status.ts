
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type BoRepositoryStatusData = {
  id: number;
  created_at: string;
  status: string;
  type: string;
  url_repository: string;
  tech: string;
  toolbuild: string;
  framework: string;
  version: string;
  release: string;
  id_type_repository: {
    id: number;
    name: string;
    short_name: string;
  };
};

export const bo_repository_status_data = {
  getAllBoRepositoriesStatusData: defineAction({
    handler: async () => {
      console.log('Fetching all repository status data from bo_repository_status table');
      const { data, error } = await supabase
        .from('bo_repository_status')
        .select(`
          *,
          id_type_repository (
            id,
            name,
            short_name
          )
        `);
      if (error) {
        console.error('Error fetching repository status data:', error.message);
        return [] as BoRepositoryStatusData[];
      }
      return data as BoRepositoryStatusData[];
    }
  })
}