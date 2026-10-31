import assert from 'node:assert/strict'
import { test } from 'vitest'
import {
  readCatalogFilters,
  updateCatalogParams,
  hasInvalidDateRange,
} from '../src/features/catalog-filters/model'
import { buildCatalogRequest, selectCatalogResponse } from '../src/entities/product/catalogQuery'
import { getCatalogFilterKey } from '../src/features/catalog-filters/catalogQueryArgs'

test('filter identity includes every API filter and excludes the search input mode', () => {
  const filters = readCatalogFilters(new URLSearchParams())
  const key = getCatalogFilterKey(filters)
  assert.equal(getCatalogFilterKey({ ...filters, searchMode: 'characters' }), key)
  const changes = {
    q: 'phone',
    category: 'beauty',
    sortBy: 'price',
    order: 'desc',
    modifiedAfter: '2026-01-01',
    modifiedBefore: '2026-06-01',
  } as const
  for (const [field, value] of Object.entries(changes)) {
    assert.notEqual(getCatalogFilterKey({ ...filters, [field]: value }), key)
  }
})

test('a shared link restores all filters and rejects invalid values', () => {
  const filters = readCatalogFilters(
    new URLSearchParams(
      'q=phone&category=smartphones&sortBy=price&order=desc&modifiedAfter=2026-01-01',
    ),
  )
  assert.equal(filters.q, 'phone')
  assert.equal(filters.category, 'smartphones')
  assert.equal(filters.sortBy, 'price')
  assert.equal(filters.order, 'desc')
  assert.equal(filters.modifiedAfter, '2026-01-01')
  const invalid = readCatalogFilters(
    new URLSearchParams('sortBy=unknown&order=oops&modifiedAfter=2026-02-30&category=../bad'),
  )
  assert.equal(invalid.sortBy, 'title')
  assert.equal(invalid.order, 'asc')
  assert.equal(invalid.modifiedAfter, '')
  assert.equal(invalid.category, '')
})

test('changing one filter preserves other parameters and resets pagination', () => {
  const previous = new URLSearchParams('q=phone&category=smartphones&page=3&source=link')
  const next = updateCatalogParams(previous, { order: 'desc' })
  assert.equal(next.get('q'), 'phone')
  assert.equal(next.get('category'), 'smartphones')
  assert.equal(next.get('source'), 'link')
  assert.equal(next.has('page'), false)
  assert.equal(previous.get('page'), '3')
  assert.equal(updateCatalogParams(next, { q: '' }).has('q'), false)
})

test('reversed date range is detected before sending a request', () => {
  const filters = readCatalogFilters(
    new URLSearchParams('modifiedAfter=2026-12-01&modifiedBefore=2026-01-01'),
  )
  assert.equal(hasInvalidDateRange(filters), true)
})

test('changing only the search mode preserves the loaded page count', () => {
  const next = updateCatalogParams(new URLSearchParams('q=phone&page=3'), {
    searchMode: 'characters',
  })
  assert.equal(next.get('page'), '3')
  assert.equal(next.get('q'), 'phone')
})

test('combined search retrieves the full category before filtering and slicing', () => {
  const args = { q: 'phone', category: 'smartphones', limit: 1, skip: 1, sortBy: 'price' as const }
  const request = buildCatalogRequest(args)
  assert.equal(request.url, '/category/smartphones')
  assert.equal(request.params.limit, 0)
  assert.equal(request.params.skip, 0)
  const result = selectCatalogResponse(
    {
      products: [
        { id: 1, title: 'Other' },
        { id: 2, title: 'Phone A' },
        { id: 3, title: 'PHONE B' },
        { id: 4 },
      ],
      total: 4,
      limit: 0,
      skip: 0,
    },
    args,
  )
  assert.equal(result.total, 2)
  assert.deepEqual(
    result.products.map((product) => product.id),
    [3],
  )
})

test('regular search sends q to the search endpoint', () => {
  const request = buildCatalogRequest({ q: 'phone', category: '', limit: 24 })
  assert.equal(request.url, '/search')
  assert.equal('q' in request.params && request.params.q, 'phone')
})

test('search results are limited to product titles', () => {
  const response = selectCatalogResponse(
    {
      products: [
        { id: 1, title: 'Apple iPhone' },
        { id: 2, title: 'Wireless earbuds' },
        { id: 3, title: 'Phone charger' },
      ],
      total: 3,
      skip: 0,
      limit: 0,
    },
    { q: 'phone', category: '', limit: 24, skip: 0 },
  )

  assert.deepEqual(
    response.products.map((product) => product.id),
    [1, 3],
  )
  assert.equal(response.total, 2)
})
