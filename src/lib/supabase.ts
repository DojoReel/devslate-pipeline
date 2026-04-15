import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://bskhuacewntnrocedwkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza2h1YWNld250bnJvY2Vkd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODQ0NTIsImV4cCI6MjA5MTI2MDQ1Mn0.AkivXXg4nvS6zm4dRgthVaMnjbckIh0lID8AAcJtoRE'
);
