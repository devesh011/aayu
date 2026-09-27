export function daysUntilNextBirthday(
  birthDate: string,
  from = new Date(),
): number {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const b = new Date(birthDate);
  let next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next < today)
    next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}
