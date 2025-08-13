// scripts/test_basename.ts
import { basenameFromPath } from '../lib/basename';

const examples = [
    'd:\\Armeta\\armeta-ml\\345pump_handbook_third_edition_mcgraw_hill-karassik.pdf',
    '/home/user/docs/report.pdf',
    'justname.pdf',
    '',
    undefined as unknown as string,
    'C:\\path\\to\\folder\\',
];

for (const ex of examples) {
    console.log('IN:', ex, '=> OUT:', JSON.stringify(basenameFromPath(ex)));
}
