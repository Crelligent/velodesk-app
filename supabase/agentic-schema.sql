-- ============================================
-- AGENTIC ESRE OS SCHEMA
-- CRD Ledger and L2 Process DAG
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CRD LEDGER SCHEMA
-- ============================================

-- CRD LEDGER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.crd_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance numeric(15, 2) NOT NULL DEFAULT 0.00,
  reserved_balance numeric(15, 2) NOT NULL DEFAULT 0.00,
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'depleted')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.crd_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view own CRD account" ON public.crd_accounts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.organization_members WHERE organization_id = crd_accounts.organization_id
    )
  );

-- CRD LEDGER TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.crd_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid REFERENCES public.crd_accounts(id) NOT NULL,
  agent_task_id uuid, -- Can be linked later to agent_executions.id
  amount numeric(15, 2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'reservation', 'consumption', 'refund', 'adjustment')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.crd_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view own CRD transactions" ON public.crd_transactions
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM public.crd_accounts WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- TRIGGER TO UPDATE ACCOUNT BALANCE
CREATE OR REPLACE FUNCTION public.update_crd_balance()
RETURNS trigger AS $$
BEGIN
  IF NEW.transaction_type = 'deposit' OR NEW.transaction_type = 'refund' OR NEW.transaction_type = 'adjustment' THEN
    UPDATE public.crd_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
  ELSIF NEW.transaction_type = 'consumption' THEN
    -- If it was a consumption, we subtract from balance and also un-reserve the amount if it was reserved
    UPDATE public.crd_accounts 
    SET balance = balance + NEW.amount, -- amount is negative
        reserved_balance = reserved_balance + NEW.amount -- reducing the reservation
    WHERE id = NEW.account_id;
  ELSIF NEW.transaction_type = 'reservation' THEN
    UPDATE public.crd_accounts SET reserved_balance = reserved_balance - NEW.amount WHERE id = NEW.account_id; -- amount is negative
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_crd_balance ON public.crd_transactions;
CREATE TRIGGER tr_update_crd_balance
  AFTER INSERT ON public.crd_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_crd_balance();


-- ============================================
-- 2. L2 PROCESS DAG SCHEMA
-- ============================================

-- L2 PROCESS WORKFLOWS
CREATE TABLE IF NOT EXISTS public.l2_workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.l2_workflows ENABLE ROW LEVEL SECURITY;
-- Policy omitted for brevity, standard org member select/admin manage

-- L2 WORKFLOW STEPS (DAG Nodes)
CREATE TABLE IF NOT EXISTS public.l2_workflow_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid REFERENCES public.l2_workflows(id) ON DELETE CASCADE NOT NULL,
  step_name text NOT NULL,
  step_order integer NOT NULL,
  execution_type text DEFAULT 'agent' CHECK (execution_type IN ('agent', 'human_approval', 'webhook')),
  required_inputs jsonb DEFAULT '{}',
  timeout_seconds integer DEFAULT 3600,
  cost_crd numeric(10, 2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.l2_workflow_steps ENABLE ROW LEVEL SECURITY;

-- AGENT EXECUTION LOG
CREATE TABLE IF NOT EXISTS public.agent_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,
  workflow_id uuid REFERENCES public.l2_workflows(id),
  step_id uuid REFERENCES public.l2_workflow_steps(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'awaiting_approval', 'completed', 'failed', 'rejected')),
  inputs jsonb,
  outputs jsonb,
  approver_id uuid REFERENCES public.profiles(id),
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_crd_accounts_updated_at ON public.crd_accounts;
CREATE TRIGGER update_crd_accounts_updated_at
  BEFORE UPDATE ON public.crd_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_l2_workflows_updated_at ON public.l2_workflows;
CREATE TRIGGER update_l2_workflows_updated_at
  BEFORE UPDATE ON public.l2_workflows
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
