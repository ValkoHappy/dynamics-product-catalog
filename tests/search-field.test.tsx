import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { SearchField } from '../src/features/catalog-filters/SearchField'
import type { SearchMode } from '../src/features/catalog-filters/model'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function Search({ mode }: { mode: SearchMode }) {
  const [value, setValue] = useState('')
  return <SearchField value={value} mode={mode} onSearch={setValue} />
}

test('four-character search keeps a space when the committed query is trimmed', () => {
  render(<Search mode="characters" />)
  const input = screen.getByRole('searchbox') as HTMLInputElement
  for (const value of ['r', 're', 'red', 'red ']) {
    fireEvent.change(input, { target: { value } })
  }
  expect(input.value).toBe('red ')
  for (const value of ['red s', 'red sh', 'red sho', 'red shoe', 'red shoes']) {
    fireEvent.change(input, { target: { value } })
  }
  expect(input.value).toBe('red shoes')
})

test('debounced search keeps a trailing space after the 400 ms pause', () => {
  vi.useFakeTimers()
  render(<Search mode="debounce" />)
  const input = screen.getByRole('searchbox') as HTMLInputElement
  fireEvent.change(input, { target: { value: 'red ' } })
  act(() => vi.advanceTimersByTime(400))
  expect(input.value).toBe('red ')
  fireEvent.change(input, { target: { value: 'red shoes' } })
  act(() => vi.advanceTimersByTime(400))
  expect(input.value).toBe('red shoes')
})

test('external query changes replace the draft and clear a pending debounce', () => {
  vi.useFakeTimers()
  const onSearch = vi.fn()
  const { rerender } = render(<SearchField value="red" mode="debounce" onSearch={onSearch} />)
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'red shoes' } })
  rerender(<SearchField value="phone" mode="debounce" onSearch={onSearch} />)
  act(() => vi.advanceTimersByTime(400))
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('phone')
  expect(onSearch).not.toHaveBeenCalled()
})

test('rapid typing sends only the last value after a full 400 ms pause', () => {
  vi.useFakeTimers()
  const onSearch = vi.fn()
  render(<SearchField value="" mode="debounce" onSearch={onSearch} />)
  const input = screen.getByRole('searchbox')
  for (const value of ['p', 'ph', 'pho', 'phon', 'phone']) {
    fireEvent.change(input, { target: { value } })
    act(() => vi.advanceTimersByTime(100))
  }
  act(() => vi.advanceTimersByTime(299))
  expect(onSearch).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1))
  expect(onSearch).toHaveBeenCalledExactlyOnceWith('phone')
})
