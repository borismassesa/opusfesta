import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ppdapuqehwlfwofbpbvb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_AMp8umOLsSNMwxOuaVLUZg__rdL7DV4';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_eX2hOvaqJmDXNfLoXpoaO1IVjAgGCBHQ25cPOSDa57';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const usersToAdd = [
  { email: 'masesawilson3@gmail.com', password: 'OpusStudio@2026', role: 'admin' },
  { email: 'isaulakh2004@gmail.com', password: 'OpusStudio@2026', role: 'admin' },
];

async function createClerkUsers() {
  for (const user of usersToAdd) {
    console.log(`Processing: ${user.email}...`);

    let clerkId;
    
    // 1. Create User in Clerk
    const res = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: [user.email],
        password: user.password,
        skip_password_checks: true
      })
    });
    
    if (!res.ok) {
      const err = await res.json();
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        console.log(`Clerk user already exists. Fetching...`);
        // Fetch to get ID
        const listRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(user.email)}`, {
          headers: { 'Authorization': `Bearer ${CLERK_SECRET_KEY}` }
        });
        const listData = await listRes.json();
        const existing = listData[0];
        clerkId = existing?.id;
        
        if (clerkId) {
          console.log(`Updating password for ${user.email}...`);
          await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: user.password })
          });
        }
      } else {
        console.error(`Failed to create Clerk user:`, JSON.stringify(err));
        continue;
      }
    } else {
      const data = await res.json();
      clerkId = data.id;
    }
    
    if (!clerkId) {
      console.error('Could not obtain clerk ID!');
      continue;
    }

    console.log(`Clerk ID: ${clerkId}`);

    // 2. Add to Supabase 'users' table
    // Try to update existing record by email, or create new
    const { data: existingSupaUser } = await supabase.from('users').select('id').eq('email', user.email).maybeSingle();
    
    if (existingSupaUser) {
        console.log(`Supabase user found, updating role...`);
        await supabase.from('users').update({ role: user.role, clerk_id: clerkId }).eq('id', existingSupaUser.id);
    } else {
        console.log(`Creating user in Supabase...`);
        await supabase.from('users').insert({
            email: user.email,
            role: user.role,
            clerk_id: clerkId
        });
    }

    console.log(`✅ Successfully provisioned ${user.email} as ${user.role}!`);
  }
}

createClerkUsers().catch(console.error);
