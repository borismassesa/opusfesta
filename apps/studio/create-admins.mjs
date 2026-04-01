import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ppdapuqehwlfwofbpbvb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_AMp8umOLsSNMwxOuaVLUZg__rdL7DV4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const usersToAdd = [
  { email: 'masesawilson3@gmail.com', password: 'OpusStudio@2026', role: 'studio_admin' },
  { email: 'isaulakh2004@gmail.com', password: 'OpusStudio@2026', role: 'studio_admin' },
];

async function createOrUpdateUsers() {
  const { data: allAuthData } = await supabase.auth.admin.listUsers();
  
  for (const user of usersToAdd) {
    console.log(`Processing: ${user.email}...`);
    
    // Check if exists
    let uid = null;
    const existing = allAuthData.users.find(u => u.email === user.email);
    
    if (existing) {
      console.log(`User already exists, forcing password update for ${user.email}...`);
      uid = existing.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(uid, {
        password: user.password
      });
      if (updateError) {
        console.error('Failed to update password:', updateError.message);
      }
    } else {
      console.log(`Creating fresh auth user: ${user.email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      if (error) {
        console.error('Failed to create:', error.message);
        continue;
      }
      uid = data.user.id;
    }

    if (!uid) continue;

    console.log(`Attaching role ${user.role} to ${user.email}...`);
    const { error: insertError } = await supabase
      .from('studio_users')
      .upsert({ user_id: uid, email: user.email, role: user.role, is_active: true }, { onConflict: 'user_id' });

    if (insertError) {
      console.error(`Failed attaching role for ${user.email}:`, insertError.message);
    } else {
      console.log(`✅ Successfully provisioned ${user.email}!`);
    }
  }
}

createOrUpdateUsers().catch(console.error);
