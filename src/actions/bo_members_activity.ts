
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

// TypeScript type for repository data
export type MemberActivity = {
  id: number;
  created_at: string;
  member_username: string;
  email: string;
  url: string;
  last_contribution_date: string;
  member_id: number;
  inactive_days: number;
};

export const bo_members_activity_data = {
  getAllMemberActivity: defineAction({
    handler: async () => {
      console.log('Fetching all member activity data from bo_member_last_contribution table');
      const { data, error } = await supabase
        .from('bo_member_last_contribution')
        .select('*');
      if (error) {
        console.error('Error fetching member activity data:', error.message);
        return [] as MemberActivity[];
      }
      console.log(data);
      return data as MemberActivity[];
    }
  })
}