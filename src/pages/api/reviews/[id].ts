import { NextApiRequest, NextApiResponse } from 'next';
import { createTRPCContext } from '../../../server/api/trpc'; // Adjust path as needed
import { appRouter } from '../../../server/api/root'; // Adjust path as needed
import { TRPCError } from '@trpc/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid carpark ID' });
  }

  try {
    // Create context and caller
    const ctx = await createTRPCContext({ req, res });
    const caller = appRouter.createCaller(ctx);

    // Call the procedure directly without using the hooks that cause errors
    const reviews = await caller.carPark.getReviews({ id });
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('API route error:', error);
    
    if (error instanceof TRPCError) {
      return res.status(500).json({ 
        error: 'TRPC Error', 
        code: error.code,
        message: error.message
      });
    }
    
    return res.status(500).json({ error: 'Server error' });
  }
}