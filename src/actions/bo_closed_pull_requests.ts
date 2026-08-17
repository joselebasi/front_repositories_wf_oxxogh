import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

export type BoClosedPullRequestData = {
  id: number;
  created_at: string;
  name_repository: string;
  project: string;
  title: string;
  source_branch: string;
  target_branch: string;
  status: string;
  label: string;
  closed_at: string;
  reviewers: string;
  url?: string;
  id_pull_request?: number;
};

export const bo_closed_pull_requests_data = {
  getAllBoClosedPullRequestsData: defineAction({
    handler: async () => {
      console.log('Fetching all closed pull requests data from bo_closed_pull_requests table');
      const { data, error } = await supabase
        .from('bo_closed_pull_requests')
        .select('*');

      if (error) {
        console.error('Error fetching closed pull requests data:', error.message);
        return [] as BoClosedPullRequestData[];
      }

      return data as BoClosedPullRequestData[];
    }
  })
};