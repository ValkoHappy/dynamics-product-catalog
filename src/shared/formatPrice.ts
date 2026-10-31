const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(price: number | undefined): string {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'Цена не указана'
  }

  return priceFormatter.format(price)
}
