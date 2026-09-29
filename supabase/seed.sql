-- ============================================
-- AGENTIC OS SEED DATA
-- Populates the L2 Process DAG with a test workflow
-- ============================================

-- Create a dummy organization for testing (if one doesn't exist)
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp')
ON CONFLICT DO NOTHING;

-- Create a dummy CRD Account for Acme Corp
INSERT INTO public.crd_accounts (organization_id, balance, reserved_balance, status)
VALUES ('00000000-0000-0000-0000-000000000001', 1000.00, 0.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert a new L2 Workflow: "PRISM Anomaly Response"
WITH new_workflow AS (
  INSERT INTO public.l2_workflows (organization_id, name, description, trigger_event)
  VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'PRISM Anomaly Response', 
    'Triggered when PRISM detects a metric drop. AI analyzes, human approves, AI executes.', 
    'prism.anomaly.detected'
  )
  RETURNING id
)
-- Insert the 3 steps into the DAG
INSERT INTO public.l2_workflow_steps (workflow_id, step_name, step_order, execution_type, timeout_seconds, cost_crd)
SELECT id, 'Analyze Anomaly & Propose Mitigation', 1, 'agent', 300, 1.50 FROM new_workflow
UNION ALL
SELECT id, 'Manager Review & Approval', 2, 'human_approval', 86400, 0.00 FROM new_workflow
UNION ALL
SELECT id, 'Execute Mitigation Protocol', 3, 'agent', 300, 5.00 FROM new_workflow;
