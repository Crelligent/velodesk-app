-- ============================================
-- WEBHOOK TRIGGER
-- Fires when an agent_execution hits 'pending'
-- Requires pg_net extension to be enabled
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_agent_edge_function()
RETURNS trigger AS $$
DECLARE
  edge_function_url text := 'https://jvbdlzbezrvlhfszxnxk.supabase.co/functions/v1/execute-agent-step';
  secret_key text;
BEGIN
  -- We assume the secret key is in vault, or for local testing we fetch from a secure config table
  -- For now, we will pass the ID and the webhook will use its own env vars
  
  -- We only fire the HTTP request if the status changed to 'pending'
  IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status != 'pending') THEN
    
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
        -- Note: In production, use vault to fetch the apikey and inject it here
      ),
      body := jsonb_build_object('execution_id', NEW.id)
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_agent_execution_pending ON public.agent_executions;
CREATE TRIGGER tr_agent_execution_pending
  AFTER INSERT OR UPDATE ON public.agent_executions
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_agent_edge_function();
