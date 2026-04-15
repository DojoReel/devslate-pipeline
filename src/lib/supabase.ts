import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bskhuacewntnrocedwkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza2h1YWNld250bnJvY2Vkd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTQyMDYsImV4cCI6MjA2MDE3MDIwNn0.LxNMqGHs-AJIxmGPDME04CdpjgDZ7_0hxgxdFqG8m-E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
