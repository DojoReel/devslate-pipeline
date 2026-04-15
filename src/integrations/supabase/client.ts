import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  'https://bskhuacewntnrocedwkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza2h1YWNld250bnJvY2Vkd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTQyMDYsImV4cCI6MjA2MDE3MDIwNn0.LxNMqGHs-AJIxmGPDME04CdpjgDZ7_0hxgxdFqG8m-E',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
