
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://konpdielhnoxfyockjxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvbnBkaWVsaG5veGZ5b2NranhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDI5NzMsImV4cCI6MjA4MzM3ODk3M30.AUdVS_TeyQH2lL1NeRj8ueLVHGtvLlHT_j8CB9Il9xA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
