
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type BoRepositoryThresholdActivityData = {
  id: number;
  created_at: string;
  limit_containers_low: number;
  limit_containers_low_last_update: string;
  limit_containers_medium: number;
  limit_containers_medium_last_update: string;
  limit_containers_high: number;
  limit_containers_high_last_update: string;
  limit_containers_critical: number;
  limit_containers_critical_last_update: string;
  limit_sast_low: number;
  limit_sast_low_last_update: string;
  limit_sast_medium: number;
  limit_sast_medium_last_update: string;
  limit_sast_high: number;
  limit_sast_high_last_update: string;
  limit_sast_critical: number;
  limit_sast_critical_last_update: string;
  limit_sca_low: number;
  limit_sca_low_last_update: string;
  limit_sca_medium: number;
  limit_sca_medium_last_update: string;
  limit_sca_high: number;
  limit_sca_high_last_update: string;
  limit_sca_critical: number;
  limit_sca_critical_last_update: string;
  name_repository: string;
  owner: string;
  url_variables: string;
};

export const bo_repository_threshold_activity_data = {
  getAllBoRepositoriesThresholdActivityData: defineAction({
    handler: async () => {
      console.log('Fetching all repository threshold activity data from bo_repository_threshold_activity table');
      const { data, error } = await supabase
        .from('bo_repository_threshold_activity')
        .select('*');
      if (error) {
        console.error('Error fetching repository threshold activity data:', error.message);
        return [] as BoRepositoryThresholdActivityData[];
      }
      return data as BoRepositoryThresholdActivityData[];
    }
  })
}