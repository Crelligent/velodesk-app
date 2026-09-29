import { withSupabase } from 'npm:@supabase/server'

// Note: Ensure verify_jwt = false in supabase/config.toml for this function
// so it can be called by the pg_net database webhook

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    // 1. Parse the incoming webhook payload from the database trigger
    const { execution_id } = await req.json()
    
    // 2. Use the admin client to fetch the pending execution step and its required inputs
    const { data: execution, error: fetchError } = await ctx.supabaseAdmin
      .from('agent_executions')
      .select('id, inputs, l2_workflow_steps (step_name, required_inputs)')
      .eq('id', execution_id)
      .single()

    if (fetchError || !execution) {
      return Response.json({ error: 'Execution not found' }, { status: 404 })
    }

    // 3. WAKE UP THE AI BRAIN
    // Here is where you would take `execution.inputs` and pass it to 
    // Anthropic (Claude) or OpenAI using their SDK. 
    // For this boilerplate, we simulate the AI thinking and producing an output:
    
    console.log(`AI Agent starting work on step: ${execution.l2_workflow_steps?.step_name}`)
    const simulated_ai_output = {
      analysis: "Anomaly detected in PRISM telemetry.",
      action_taken: "Scaled up Edge resources automatically.",
      confidence: 0.98
    }

    // 4. Mark the step as complete in the DAG
    // We call our Next.js backend API (/api/l2/complete-step) using the secret key
    const backendUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://host.docker.internal:3000'
    const secretKey = Deno.env.get('SUPABASE_SECRET_KEY')!

    const completeRes = await fetch(`${backendUrl}/api/l2/complete-step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': secretKey
      },
      body: JSON.stringify({
        execution_id: execution.id,
        status: 'completed',
        outputs: simulated_ai_output
      })
    })

    const completeData = await completeRes.json()

    return Response.json({ success: true, ai_output: simulated_ai_output, next_step: completeData })
  })
}
