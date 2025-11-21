
import { createClient } from '@supabase/supabase-js';

// Project URL and Anon Key provided by the user
const supabaseUrl = 'https://escwcpcpdbwfdairdacp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY3djcGNwZGJ3ZmRhaXJkYWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjM4ODgsImV4cCI6MjA3OTI5OTg4OH0.gO8voCccV8wmRa8lR6qUhXqK2rrYHpBUAUg-xL1fMIw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
