import { defineAction } from 'astro:actions';
import { supabase } from './db_client';
import { z } from 'astro:schema';

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
  }),
  getWfRepositoriesDataByIdType: defineAction({
    handler: async (id_type) => {
      console.log(`Fetching repository data for Type: ${id_type}`);
      const { data, error } = await supabase
        .from('wf_repositories_data')
        .select(`
          *,
          id_type_repository (
            id,
            name,
            short_name
          )
        `)
        .eq('id_type_repository', id_type)
        .order('update_at', { ascending: false });
      if (error) {
        console.error('Error fetching repositories data:', error.message);
        return [];
      }
      return data;
    }
  }),
  updateRowWfRepositoriesData: defineAction({
    input: z.object({
      id: z.number(),
      change_velocity_flag: z.boolean(),
      checkmarx_flag: z.boolean(),
      continuous_build_flag: z.boolean(),
      id_technical_leader: z.number().nullable(), // allow null
    }),
    handler: async (input) => {
      console.log(input);
      // validate input.id_technical_leader is zero change to NULL
      if (input.id_technical_leader === 0) {
        input.id_technical_leader = null;
      }
      console.log('Updating repository data in wf_repositories_data table');
      const { data, error } = await supabase
        .from('wf_repositories_data')
        .update({
          change_velocity_flag: input.change_velocity_flag,
          checkmarx_flag: input.checkmarx_flag,
          continuous_build_flag: input.continuous_build_flag,
          id_technical_leader: input.id_technical_leader
        })
        .eq('id', input.id);
      if (error) {
        console.error('Error updating repositories data:', error.message);
        return [];
      }
      return data;
    }
  }),
  getWfRepositoriesDataById: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async (input) => {
      console.log(`Fetching repository data for ID: ${input.id}`);
      const { data, error } = await supabase
        .from('wf_repositories_data')
        .select(`
            *,
            wf_repositories_data_id_type_repository_fkey (
              id,
              name,
              short_name
            ),
            wf_repositories_data_id_technical_leader_fkey (
              id,
              name,
              email
            )
          `)
        .eq('id', input.id);
      if (error) {
        console.error('Error fetching repository data:', error.message);
        return null;
      }
      return data;
    }
  })
}