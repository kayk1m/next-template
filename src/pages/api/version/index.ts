import { NextApiBuilder } from '@/backend/api-wrapper';

import type { NextApiRequest, NextApiResponse } from 'next';

export const API_VERSION = '0.1.0';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.json({ apiVersion: API_VERSION });
  }
};

export default new NextApiBuilder(handler).build();
