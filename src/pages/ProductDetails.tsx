import type { Product } from '../entities/product/types'
import type { ReactNode } from 'react'
import { ProductImage } from '../shared/ProductImage'
import { formatDate } from '../shared/formatDate'
import { formatPrice } from '../shared/formatPrice'
import styles from './ProductPage.module.scss'

interface ProductDetailsProps {
  product: Product
  action?: ReactNode
}

export function ProductDetails({ product, action }: ProductDetailsProps) {
  const updatedAt = formatDate(product.meta?.updatedAt)

  return (
    <div className={styles.product}>
      <div className={styles.image}>
        <ProductImage
          src={product.images?.[0] || product.thumbnail}
          alt={product.title || 'Товар'}
          loading="eager"
        />
      </div>
      <div>
        <p>{product.category ?? 'Без категории'}</p>
        <h1>{product.title || 'Без названия'}</h1>
        <p className={styles.price}>{formatPrice(product.price)}</p>
        {action}
        <p>{product.description}</p>
        {updatedAt && <p className={styles.updatedAt}>Обновлено: {updatedAt}</p>}
        <dl>
          {product.brand && (
            <>
              <dt>Бренд</dt>
              <dd>{product.brand}</dd>
            </>
          )}
          {typeof product.rating === 'number' && (
            <>
              <dt>Рейтинг</dt>
              <dd>{product.rating}</dd>
            </>
          )}
          {typeof product.discountPercentage === 'number' && (
            <>
              <dt>Скидка</dt>
              <dd>{product.discountPercentage}%</dd>
            </>
          )}
          {typeof product.stock === 'number' && (
            <>
              <dt>В наличии</dt>
              <dd>{product.stock} шт.</dd>
            </>
          )}
          {product.availabilityStatus && (
            <>
              <dt>Статус</dt>
              <dd>{product.availabilityStatus}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}
