import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Product } from './types'
import styles from './ProductCard.module.scss'
import { ProductImage } from '../../shared/ProductImage'
import { formatPrice } from '../../shared/formatPrice'

interface ProductCardProps {
  product: Product
  action?: ReactNode
  returnTo?: string
}

export function ProductCard({ product, action, returnTo = '/' }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <Link to={`/products/${product.id}`} state={{ returnTo }} className={styles.link}>
        <div className={styles.image}>
          <ProductImage src={product.thumbnail} alt="" />
        </div>
        <div className={styles.body}>
          <p className={styles.category}>{product.category ?? 'Без категории'}</p>
          <h2>{product.title || 'Без названия'}</h2>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.rating}>
            ★ {typeof product.rating === 'number' ? product.rating.toFixed(1) : 'Нет оценок'}
          </p>
        </div>
      </Link>
      {action && <div className={styles.action}>{action}</div>}
    </article>
  )
}
