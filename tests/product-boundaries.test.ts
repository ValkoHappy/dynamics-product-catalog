import assert from 'node:assert/strict'
import { test } from 'vitest'
import { parseProductId } from '../src/entities/product/parseProductId'
import { formatPrice } from '../src/shared/formatPrice'

test('invalid route parameters cannot become product requests', () => {
  for (const value of [undefined, '', '0', '-1', '1.5', '1e2', '12abc', '9007199254740992']) {
    assert.equal(parseProductId(value), null)
  }
  assert.equal(parseProductId('123'), 123)
})

test('missing or invalid prices do not render NaN or Infinity', () => {
  for (const value of [undefined, NaN, Infinity, -Infinity]) {
    assert.equal(formatPrice(value), 'Цена не указана')
  }
  assert.match(formatPrice(0), /0,00/)
  assert.match(formatPrice(12.5), /12,50/)
})
