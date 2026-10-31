import { Link } from 'react-router-dom'
import { CreateProductForm } from '../features/product-mutations/CreateProductForm'
import { UpdateProductForm } from '../features/product-mutations/UpdateProductForm'
import { DeleteProductForm } from '../features/product-mutations/DeleteProductForm'
import styles from '../features/product-mutations/ProductMutations.module.scss'

export function ProductOperationsPage() {
  return (
    <section>
      <Link to="/">← В каталог</Link>
      <h1>Операции API</h1>
      <p>
        Демонстрация создания, обновления и удаления товаров. DummyJSON возвращает ответ, но не
        сохраняет изменения. Товары и цены в каталоге после этих запросов останутся прежними.
      </p>
      <div className={styles.grid}>
        <CreateProductForm />
        <UpdateProductForm />
        <DeleteProductForm />
      </div>
    </section>
  )
}
