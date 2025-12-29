
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';
import { z } from 'astro:schema';
// TypeScript type for repository data
export type MemberTeam = {
  id: number;
  created_at: string;
  member_id: number;
  team: string;
};

export const bo_members_team_data = {
  getTeamsByMemberId: defineAction({
    input: z.object({
      member_id: z.number(),
    }),
    handler: async (input) => {
      console.log('Fetching all member team data from bo_member_team table');
      const { data, error } = await supabase
        .from('bo_member_team')
        .select('*')
        .eq('member_id', input.member_id);
      if (error) {
        console.error('Error fetching member team data:', error.message);
        return [] as MemberTeam[];
      }
      return data as MemberTeam[];
    }
  }),
  getAllMemberTeams: defineAction({
    handler: async () => {
      console.log('Fetching all member teams from bo_member_team table');
      const { data, error } = await supabase
        .from('bo_member_team')
        .select('*');
      if (error) {
        console.error('Error fetching all member teams:', error.message);
        return [] as MemberTeam[];
      }
      return data as MemberTeam[];
    }
  })
}