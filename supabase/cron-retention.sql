-- ==============================================================================
-- VELODESK FORM ENGINE - DATA RETENTION CRON
-- Requires pg_cron extension in Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cleanup function
CREATE OR REPLACE FUNCTION delete_expired_form_submissions()
RETURNS void AS $$
BEGIN
    -- Delete submissions older than the form's retention_days policy
    DELETE FROM public.form_submissions fs
    USING public.forms f
    WHERE fs.form_id = f.id 
    AND f.retention_days IS NOT NULL 
    AND fs.submitted_at < NOW() - (f.retention_days || ' days')::INTERVAL;

    -- Also clean up abandoned partial submissions older than 30 days
    DELETE FROM public.form_partial_submissions
    WHERE last_active_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run daily at 1 AM
SELECT cron.schedule(
    'retention-cleanup-job',
    '0 1 * * *',
    $$SELECT delete_expired_form_submissions()$$
);
