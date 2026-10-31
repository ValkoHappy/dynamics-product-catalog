import { useState } from 'react'
import { useAddProductMutation } from '../../entities/product/api'
import { MutationResult } from './MutationResult'
import styles from './ProductMutations.module.scss'

export function CreateProductForm() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [createProduct, result] = useAddProductMutation()

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void createProduct({ title: title.trim(), price: Number(price) })
      }}
    >
      <h2>Добавить товар</h2>
      <label>
        Название
        <input
          required
          pattern=".*\S.*"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        Цена нового товара
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>
      <button disabled={result.isLoading} type="submit">
        Отправить POST
      </button>
      <MutationResult data={result.data} loading={result.isLoading} error={result.isError} />
    </form>
  )
}
