import { supabase } from './db_client';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from('wf_repositories_data')
    .select('*');
  if (error) {
    console.error('Error fetching all repositories:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}