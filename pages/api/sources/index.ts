// pages/api/sources/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const rows = await prisma.ragSource.findMany({
                orderBy: { source_id: 'asc' },
            });
            return res.status(200).json(rows);
        }

        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('GET /api/sources error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
