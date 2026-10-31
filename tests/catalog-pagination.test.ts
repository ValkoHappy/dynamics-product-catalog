import assert from 'node:assert/strict'
import { test } from 'vitest'
import { readPageCount } from '../src/features/catalog-pagination/model'
import { collectProducts, nextPageOffset } from '../src/entities/product/pagination'
import type { ProductsResponse } from '../src/entities/product/types'

test('invalid page values cannot trigger unbounded restoration', () => {
  for (const value of [null, '', '0', '-1', '1.5', '1e3', 'Infinity']) {
    assert.equal(readPageCount(value), 1)
  }
  assert.equal(readPageCount('3'), 3)
  assert.equal(readPageCount('1000000'), 100)
})

test('pagination stops on the final page or an unexpectedly empty response', () => {
  assert.equal(nextPageOffset({ products: [{ id: 1 }], total: 50, limit: 24, skip: 0 }), 24)
  assert.equal(
    nextPageOffset({ products: [{ id: 49 }], total: 50, limit: 24, skip: 48 }),
    undefined,
  )
  assert.equal(nextPageOffset({ products: [], total: 50, limit: 24, skip: 24 }), undefined)
})

test('visible page count is respected and repeated IDs do not create duplicate cards', () => {
  const pages: ProductsResponse[] = [
    { products: [{ id: 1 }, { id: 2 }], total: 4, skip: 0, limit: 2 },
    { products: [{ id: 2 }, { id: 3 }], total: 4, skip: 2, limit: 2 },
  ]
  assert.deepEqual(
    collectProducts(pages, 1).map((product) => product.id),
    [1, 2],
  )
  assert.deepEqual(
    collectProducts(pages, 2).map((product) => product.id),
    [1, 2, 3],
  )
  assert.equal(pages[1]?.products.length, 2)
})
