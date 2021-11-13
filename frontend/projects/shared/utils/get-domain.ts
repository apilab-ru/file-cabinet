export function getDomain(url: string): string {
  return url.split('/')[2];
}
