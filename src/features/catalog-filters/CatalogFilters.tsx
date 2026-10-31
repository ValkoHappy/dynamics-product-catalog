import { useCallback, useState } from 'react'
import { useGetCategoriesQuery } from '../../entities/product/api'
import { SearchField } from './SearchField'
import {
  type CatalogFilters as Filters,
  SORT_OPTIONS,
  readSearchMode,
  readSortField,
  readSortOrder,
} from './model'
import styles from './CatalogFilters.module.scss'

interface CatalogFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onReset: () => void
}

export function CatalogFilters({ filters, onChange, onReset }: CatalogFiltersProps) {
  const [searchRevision, setSearchRevision] = useState(0)
  const { data: categories, isLoading, isError, refetch } = useGetCategoriesQuery()
  const search = useCallback((q: string) => onChange({ q }), [onChange])

  return (
    <div className={styles.filters}>
      <SearchField
        key={searchRevision}
        value={filters.q}
        mode={filters.searchMode}
        onSearch={search}
      />
      <div className={styles.fields}>
        <label>
          Режим поиска
          <select
            value={filters.searchMode}
            onChange={(event) => onChange({ searchMode: readSearchMode(event.target.value) })}
          >
            <option value="debounce">Пауза 400 мс</option>
            <option value="characters">Каждые 4 символа</option>
          </select>
        </label>
        <label>
          Категория
          <select
            disabled={isLoading || isError}
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            <option value="">Все категории</option>
            {filters.category &&
              !categories?.some((category) => category.slug === filters.category) && (
                <option value={filters.category}>{filters.category} (из ссылки)</option>
              )}
            {categories?.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Сортировка
          <select
            value={filters.sortBy}
            onChange={(event) => onChange({ sortBy: readSortField(event.target.value) })}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Порядок
          <select
            value={filters.order}
            onChange={(event) => onChange({ order: readSortOrder(event.target.value) })}
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </label>
        <label>
          Изменены после
          <input
            type="date"
            value={filters.modifiedAfter}
            onChange={(event) => onChange({ modifiedAfter: event.target.value })}
          />
        </label>
        <label>
          Изменены до
          <input
            type="date"
            value={filters.modifiedBefore}
            onChange={(event) => onChange({ modifiedBefore: event.target.value })}
          />
        </label>
      </div>
      {isLoading && <p role="status">Загружаем категории…</p>}
      {isError && (
        <p role="alert">
          Не удалось загрузить категории.{' '}
          <button type="button" onClick={() => void refetch()}>
            Повторить
          </button>
        </p>
      )}
      <button
        type="button"
        className={styles.reset}
        onClick={() => {
          setSearchRevision((revision) => revision + 1)
          onReset()
        }}
      >
        Сбросить фильтры
      </button>
    </div>
  )
}
