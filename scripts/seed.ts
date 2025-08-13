// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const p = path.join(process.cwd(), 'rag_sources.json');
    if (!fs.existsSync(p)) {
        console.error('Файл rag_sources.json не найден в корне проекта:', p);
        process.exit(1);
    }

    const raw = fs.readFileSync(p, 'utf-8');
    let arr: any[];
    try {
        arr = JSON.parse(raw);
        if (!Array.isArray(arr)) throw new Error('Ожидался массив объектов');
    } catch (e) {
        console.error('Ошибка парсинга rag_sources.json:', e);
        process.exit(1);
    }

    console.log(`Найдено записей для импорта: ${arr.length}`);

    let imported = 0;
    for (const item of arr) {
        if (!item.source_id) {
            console.warn('Пропускаю запись без source_id:', item);
            continue;
        }

        // безопасное приведение year
        const year = item.year === undefined || item.year === null || item.year === '' ? null : parseInt(String(item.year), 10);

        try {
            await prisma.ragSource.upsert({
                where: { source_id: item.source_id },
                update: {
                    filename: item.filename ?? null,
                    title: item.title ?? null,
                    author: item.author ?? null,
                    year,
                    edition: item.edition ?? null,
                    publisher: item.publisher ?? null,
                    source_url: item.source_url ?? null,
                },
                create: {
                    source_id: item.source_id,
                    filename: item.filename ?? null,
                    title: item.title ?? null,
                    author: item.author ?? null,
                    year,
                    edition: item.edition ?? null,
                    publisher: item.publisher ?? null,
                    source_url: item.source_url ?? null,
                },
            });
            imported++;
        } catch (err) {
            console.error(`Ошибка при вставке source_id=${item.source_id}:`, err);
        }
    }

    console.log(`Импорт завершён. Успешно обработано: ${imported}/${arr.length}`);
}

main()
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
