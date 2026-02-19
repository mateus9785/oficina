let counter = 1000;

export function generateId(prefix = ''): string {
  counter++;
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${counter}_${random}` : `${counter}_${random}`;
}
