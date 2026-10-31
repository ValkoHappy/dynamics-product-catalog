import styles from './RequestState.module.scss'

interface RequestStateProps {
  message: string
  onRetry?: () => void
  error?: boolean
}

export function RequestState({ message, onRetry, error = false }: RequestStateProps) {
  return (
    <div className={styles.state} role={error ? 'alert' : 'status'}>
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
