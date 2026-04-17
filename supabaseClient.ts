
import { createClient } from '@supabase/supabase-js';

// Project URL and Anon Key provided by the user
const supabaseUrl = 'https://zivsxswjlrmdkgebvdsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdnN4c3dqbHJtZGtnZWJ2ZHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjA2MjQsImV4cCI6MjA5MTkzNjYyNH0.-E6IWBqptoACarYUBv2knHCLULcyFSTv8zhIaaQBRxk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
