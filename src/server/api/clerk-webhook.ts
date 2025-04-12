import { Webhook } from 'svix';
import { buffer } from 'micro';
import { syncUserToSupabase } from '../../lib/supabase/user-management';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Define a more specific type for Clerk user data
interface ClerkUserData {
  id: string;
  email_addresses?: Array<{
    email_address: string;
    verification?: {
      status: string;
    };
  }>;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  // Add other specific fields as needed
}

interface WebhookEvent {
  data: ClerkUserData;
  type: string;
  object: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Verify webhook signature
  const payload = await buffer(req);
  const headersList = req.headers;
  
  const svixHeaders = {
    'svix-id': headersList['svix-id'] as string,
    'svix-timestamp': headersList['svix-timestamp'] as string,
    'svix-signature': headersList['svix-signature'] as string,
  };
  
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }
  
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;
  
  try {
    evt = wh.verify(payload.toString(), svixHeaders) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ message: 'Invalid signature' });
  }
  
  // Handle different event types
  const { type, data } = evt;
  
  try {
    if (type === 'user.created' || type === 'user.updated') {
      await syncUserToSupabase(data.id);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ success: false, error: 'Failed to process webhook' });
  }
}