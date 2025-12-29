import { defineAction } from 'astro:actions';
import { supabase } from './db_client';

export type MemberActivity = {
  id: number;
  created_at: string;
  member_username: string;
  email: string;
  url: string;
  last_contribution_date: string;
  member_id: number;
  inactive_days: number;

  // relación 1 → N
  bo_member_team: {
    id: number;
    team: string;
  }[];
};

export const bo_members_activity_fk_data = {
  getAllMemberActivity: defineAction({
    handler: async () => {
      console.log('Fetching member activity with teams');

      const { data, error } = await supabase
        .from('bo_member_last_contribution')
        .select(`
          id,
          created_at,
          member_username,
          email,
          url,
          last_contribution_date,
          member_id,
          inactive_days,
          bo_member_team (
            id,
            team
          )
        `);

      if (error) {
        console.error('Error fetching member activity data:', error);
        return [];
      }
      return data as MemberActivity[];
    }
  })
};
