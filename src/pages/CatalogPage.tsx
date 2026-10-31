import { CatalogResults } from './CatalogResults'
import { CatalogFilters } from '../features/catalog-filters/CatalogFilters'
import { useCatalogFilters } from '../features/catalog-filters/useCatalogFilters'
import styles from './CatalogPage.module.scss'

export function CatalogPage() {
  const { filters, updateFilters, resetFilters } = useCatalogFilters()
  return (
    <section>
      <div className={styles.heading}>
        <div>
          <h1>Каталог товаров</h1>
        </div>
      </div>
      <CatalogFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
      <CatalogResults filters={filters} />
    </section>
  )
}
