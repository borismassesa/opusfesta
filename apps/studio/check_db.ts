import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking services...");
  const { data: services, error: sErr } = await supabase.from('studio_services').select('*');
  console.log("Services:", services);
  console.log("Err:", sErr);
  
  console.log("Checking packages...");
  const { data: packages, error: pErr } = await supabase.from('studio_packages').select('*');
  console.log("Packages:", packages);
  console.log("Err:", pErr);
}

check();
