export function slugify(input: string, kind = 'Name'): string {
  const value = input
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  if (!value) throw new Error(`${kind} must contain letters or numbers.`);
  return value;
}
