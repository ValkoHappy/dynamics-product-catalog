import { useState } from 'react'
import { useUpdateProductMutation } from '../../entities/product/api'
import type { UpdateProductInput } from '../../entities/product/types'
import { MutationResult } from './MutationResult'
import styles from './ProductMutations.module.scss'

export function UpdateProductForm() {
  const [id, setId] = useState('1')
  const [price, setPrice] = useState('')
  const [method, setMethod] = useState<NonNullable<UpdateProductInput['method']>>('PATCH')
  const [updateProduct, result] = useUpdateProductMutation()

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void updateProduct({ id: Number(id), method, changes: { price: Number(price) } })
      }}
    >
      <h2>Изменить цену</h2>
      <label>
        ID изменяемого товара
        <input
          required
          type="number"
          min="1"
          step="1"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
      </label>
      <label>
        Новая цена
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>
      <label>
        Метод обновления
        <select value={method} onChange={(event) => setMethod(event.target.value as typeof method)}>
          <option value="PATCH">PATCH</option>
          <option value="PUT">PUT</option>
        </select>
      </label>
      <button disabled={result.isLoading} type="submit">
        Отправить {method}
      </button>
      <MutationResult data={result.data} loading={result.isLoading} error={result.isError} />
    </form>
  )
}
