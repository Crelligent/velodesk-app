import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        "https://trrklkqogomnqvvofhxg.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTE5NzcsImV4cCI6MjA4MjAyNzk3N30.pTlTiwFxZPSDgvGojlHotrFhSg0iFhxSp5Ba6uHcypA"
    )
}
