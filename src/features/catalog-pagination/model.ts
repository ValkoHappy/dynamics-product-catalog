const MAX_RESTORED_PAGES = 100

export function readPageCount(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1
  const page = Number(value)
  if (!Number.isSafeInteger(page) || page < 1) return 1
  return Math.min(page, MAX_RESTORED_PAGES)
}
