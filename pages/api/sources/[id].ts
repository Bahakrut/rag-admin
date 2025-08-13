// pages/api/sources/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Payload = {
    filename?: string | null;
    title?: string | null;
    author?: string | null;
    year?: number | string | null;
    edition?: string | null;
    publisher?: string | null;
    source_url?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    try {
        if (req.method === 'PUT') {
            const body: Payload = req.body ?? {};

            // Защита: запрещаем менять PK
            if ((body as any).source_id) {
                delete (body as any).source_id;
            }

            // Приведение year к числу или null
            if (body.year !== undefined) {
                if (body.year === '' || body.year === null) {
                    body.year = null;
                } else if (typeof body.year === 'string') {
                    const n = parseInt(body.year, 10);
                    body.year = Number.isNaN(n) ? null : n;
                }
            }

            const updated = await prisma.ragSource.update({
                where: { source_id: String(id) },
                data: {
                    filename: body.filename ?? undefined,
                    title: body.title ?? undefined,
                    author: body.author ?? undefined,
                    year: body.year ?? undefined,
                    edition: body.edition ?? undefined,
                    publisher: body.publisher ?? undefined,
                    source_url: body.source_url ?? undefined,
                },
            });

            return res.status(200).json(updated);
        }

        res.setHeader('Allow', 'PUT');
        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (err: any) {
        console.error('PUT /api/sources/[id] error:', err);
        // Prisma error when record not found
        if (err?.code === 'P2025' || /Record to update not found/.test(String(err))) {
            return res.status(404).json({ error: 'Record not found' });
        }
        return res.status(500).json({ error: err?.message ?? 'Internal server error' });
    }
}
