import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { project_id } = await req.json()

    if (!project_id) {
      return new Response(
        JSON.stringify({ error: 'project_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase Client with the caller's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Fetch overdue tasks using the caller's JWT so table RLS still applies.
    const now = new Date().toISOString()
    const { data: tasks, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('project_id', project_id)
      .lt('due_date', now)
      .neq('status', 'done')

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tasksWithAssigneeName = (tasks ?? []).map((task) => ({
      ...task,
      assignee_name: task.assignee_id
        ? `User ${task.assignee_id.slice(0, 4).toUpperCase()}`
        : 'Unassigned',
    }))
    
    return new Response(
      JSON.stringify(tasksWithAssigneeName),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected request error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
