
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';
import { z } from 'astro:schema';

export const wf_repositories_log = {
  createLogRepository: defineAction({
    input: z.object({
      id_repository: z.number(),
      comment: z.string(),
      created_by: z.string(),
    }),
    handler: async (input) => {
      const { data, error } = await supabase
        .from('wf_repositories_log')
        .insert({ id_repository: input.id_repository, comment: input.comment, created_by: input.created_by });
      if (error) {
        console.error('Error inserting technical leader:', error.message);
        return `Error inserting log!`
      }
      return `Inserted log for repository ${input.id_repository}!`
    }
  }),
  getAllLogByRepositoryId: defineAction({
    input: z.object({
      id_repository: z.number(),
    }),
    handler: async (input) => {
      const { data, error } = await supabase
        .from('wf_repositories_log')
        .select('*')
        .eq('id_repository', input.id_repository);
      if (error) {
        console.error('Error fetching logs:', error.message);
        return `Error fetching logs!`
      }
      return data;
    }
  })
}