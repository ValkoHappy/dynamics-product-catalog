import { useEffect, useRef, useState } from 'react'
import type { SearchMode } from './model'
import styles from './CatalogFilters.module.scss'

interface SearchFieldProps {
  value: string
  mode: SearchMode
  onSearch: (value: string) => void
}

export function SearchField({ value, mode, onSearch }: SearchFieldProps) {
  const [input, setInput] = useState({ committed: value, draft: value })
  const draft = input.draft
  const editedCharacters = useRef(0)

  useEffect(() => {
    editedCharacters.current = 0
  }, [value, mode])

  if (input.committed !== value) {
    setInput({ committed: value, draft: draft.trim() === value ? draft : value })
  }

  useEffect(() => {
    if (mode !== 'debounce' || draft.trim() === value) return
    const timer = window.setTimeout(() => onSearch(draft.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [draft, mode, onSearch, value])

  function changeSearch(next: string) {
    setInput((previous) => ({ ...previous, draft: next }))
    if (!next) {
      editedCharacters.current = 0
      onSearch('')
      return
    }
    editedCharacters.current += Math.max(1, Math.abs(next.length - draft.length))
    if (mode === 'characters' && editedCharacters.current >= 4) {
      editedCharacters.current = 0
      onSearch(next.trim())
    }
  }

  return (
    <form
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault()
        editedCharacters.current = 0
        onSearch(draft.trim())
      }}
    >
      <label htmlFor="product-search">Поиск</label>
      <div className={styles.searchControls}>
        <input
          id="product-search"
          type="search"
          value={draft}
          placeholder="Название товара"
          onChange={(event) => changeSearch(event.target.value)}
        />
        <button type="submit">Найти</button>
        <button type="button" disabled={!draft} onClick={() => changeSearch('')}>
          Очистить
        </button>
      </div>
      <small>
        {mode === 'debounce'
          ? 'Поиск через 400 мс после ввода'
          : 'Поиск после каждых 4 изменений текста. Enter: найти сразу.'}
      </small>
    </form>
  )
}
