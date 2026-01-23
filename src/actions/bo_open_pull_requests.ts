
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type BoOpenPullRequestData = {
  id: number;
  created_at: string;
  author: string;
  source_branch: string;
  target_branch: string;
  title: string;
  url: string;
  id_pull_request: number;
  reviewers: string;
  name_repository: string;
};

export const bo_open_pull_requests_data = {
  getAllBoOpenPullRequestsData: defineAction({
    handler: async () => {
      console.log('Fetching all open pull requests data from bo_open_pull_requests table');
      const { data, error } = await supabase
        .from('bo_open_pull_requests')
        .select('*');
      if (error) {
        console.error('Error fetching open pull requests data:', error.message);
        return [] as BoOpenPullRequestData[];
      }
      return data as BoOpenPullRequestData[];
    }
  })
}