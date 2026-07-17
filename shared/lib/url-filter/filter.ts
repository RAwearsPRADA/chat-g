export function urlFilter(url: string): string | null {
    if (url.startsWith('/_next/static') || url === '/icon.svg') return null
    return url
}