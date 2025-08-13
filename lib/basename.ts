// lib/basename.ts
export function basenameFromPath(path?: string, { emptyPlaceholder = '' } = {}): string {
    if (!path) return emptyPlaceholder;
    const trimmed = String(path).trim();
    const parts = trimmed.split(/[/\\]+/);
    const name = parts.pop() ?? '';
    return name;
}

export function truncateMiddle(str: string, max = 50) {
    if (!str) return str;
    if (str.length <= max) return str;
    const half = Math.floor((max - 1) / 2);
    return `${str.slice(0, half)}…${str.slice(str.length - half)}`;
}
