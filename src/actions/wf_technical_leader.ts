import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { supabase } from './db_client';

export const wf_technical_leader = {
  saveWfTechnicalLeader: defineAction({
    input: z.object({
      name: z.string(),
      middle_name: z.string(),
      last_name: z.string(),
      email: z.string().email(),
    }),
    handler: async (input) => {
      const { data, error } = await supabase
        .from('wf_technical_leader')
        .insert({ name: input.name, middle_name: input.middle_name, last_name: input.last_name, email: input.email });
      if (error) {
        console.error('Error inserting technical leader:', error.message);
        return `Correo duplicado!`      
      }
      return `Inserted, ${input.name}!`
    }
  }),
  getAllWfTechnicalLeaders: defineAction({
    handler: async () => {
      const { data, error } = await supabase
        .from('wf_technical_leader')
        .select('*');
      if (error) {
        console.error('Error fetching technical leaders:', error.message);
        return [];
      }
      return data;
    }
  })
}