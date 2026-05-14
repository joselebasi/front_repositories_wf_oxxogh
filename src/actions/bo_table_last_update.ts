
import { defineAction } from 'astro:actions';
import { supabase } from './db_client';
import { z } from 'astro:schema';
// TypeScript type for repository data
export type TableLastUpdate = {
  id: number;
  created_at: string;
  table_name: string;
  last_update: string;
};

export const bo_table_last_update_data = {
  getTableLastUpdateByTableName: defineAction({
    input: z.object({
      table_name: z.string(),
    }),
    handler: async (input) => {
      console.log('Fetching table last update data from bo_table_last_update table');
      const { data, error } = await supabase
        .from('bo_table_last_update')
        .select('*')
        .eq('table_name', input.table_name)
        .order('last_update', { ascending: false })
        .limit(1);
      if (error) {
        console.error('Error fetching table last update data:', error.message);
        return [] as TableLastUpdate[];
      }
      return data as TableLastUpdate[];
    }
  })
}
