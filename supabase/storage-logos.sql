-- Create storage bucket for logos
-- Run this in Supabase SQL Editor

-- Insert the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own logo"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own logo
create policy "Users can update own logo"
on storage.objects for update
to authenticated
using (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own logo
create policy "Users can delete own logo"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all logos (for report generation)
create policy "Public can view logos"
on storage.objects for select
to public
using (bucket_id = 'logos');
