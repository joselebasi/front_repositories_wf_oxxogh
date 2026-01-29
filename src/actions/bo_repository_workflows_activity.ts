
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type BoRepositoryWorkflowsActivityData = {
  id: number;
  created_at: string;
  have_checkmarx: boolean;
  have_continuous_build: boolean;
  have_conjur: boolean;
  have_change_velocity: boolean;
  have_release_sharepoint: boolean;
  have_release_github: boolean;
  have_validate_pr: boolean;
  name_repository: string;
  id_type_repository: {
    id: number;
    name: string;
    short_name: string;
  };
  owner: string;
  url_workflows: string;
  is_cloud: boolean;
};

export const bo_repository_workflows_activity_data = {
  getAllBoRepositoriesWorkflowsActivityData: defineAction({
    handler: async () => {
      console.log('Fetching all repository workflows activity data from bo_repository_workflows_activity table');
      const { data, error } = await supabase
        .from('bo_repository_workflows_activity')
        .select(`
          *,
          id_type_repository (
            id,
            name,
            short_name
          )
        `);
      if (error) {
        console.error('Error fetching repository workflows activity data:', error.message);
        return [] as BoRepositoryWorkflowsActivityData[];
      }
      return data as BoRepositoryWorkflowsActivityData[];
    }
  })
}