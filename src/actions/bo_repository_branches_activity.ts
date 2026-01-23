
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type BoRepositoryActivityData = {
  id: number;
  created_at: string;
  name: string;
  url: string;
  branch: string;
  last_commit_date: string;
  member_name: string;
  id_type_repository: {
    id: number;
    name: string;
    short_name: string;
  };
  email: string;
};

export const bo_repositories_activity_data = {
  getAllBoRepositoriesActivityData: defineAction({
    handler: async () => {
      console.log('Fetching all repositories data from bo_repository_branches_activity table');
      const { data, error } = await supabase
        .from('bo_repository_branches_activity')
        .select(`
          *,
          id_type_repository (
            id,
            name,
            short_name
          )
        `);
      if (error) {
        console.error('Error fetching repository branches activity data:', error.message);
        return [] as BoRepositoryActivityData[];
      }
      return data as BoRepositoryActivityData[];
    }
  })
}