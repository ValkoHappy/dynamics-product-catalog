import { useState } from 'react'
import { useDeleteProductMutation } from '../../entities/product/api'
import { MutationResult } from './MutationResult'
import styles from './ProductMutations.module.scss'

export function DeleteProductForm() {
  const [id, setId] = useState('1')
  const [deleteProduct, result] = useDeleteProductMutation()

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void deleteProduct(Number(id))
      }}
    >
      <h2>Удалить товар</h2>
      <label>
        ID удаляемого товара
        <input
          required
          type="number"
          min="1"
          step="1"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
      </label>
      <button disabled={result.isLoading} type="submit">
        Отправить DELETE
      </button>
      <MutationResult data={result.data} loading={result.isLoading} error={result.isError} />
    </form>
  )
}
