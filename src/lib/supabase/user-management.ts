import { createClient } from '@supabase/supabase-js';
// Using the correct Clerk import for TypeScript
import { clerkClient } from '@clerk/nextjs/server';

// Make sure these environment variables are properly defined in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// This function should be called after a user signs up with Clerk
export async function syncUserToSupabase(clerkUserId: string) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Get user data from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  
  // Initialize Supabase client with service role key (admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Create or update user in Supabase
  const { data, error } = await supabase
    .from('users')
    .upsert({
      clerk_id: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      avatar_url: clerkUser.imageUrl || null,
    }, {
      onConflict: 'clerk_id'
    });
  
  if (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }
  
  return data;
}