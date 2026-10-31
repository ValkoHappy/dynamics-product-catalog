export function formatDate(value: string | undefined): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date)
}
