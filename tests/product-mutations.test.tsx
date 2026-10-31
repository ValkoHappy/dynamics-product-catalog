import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { productsApi } from '../src/entities/product/api'
import { CreateProductForm } from '../src/features/product-mutations/CreateProductForm'
import { UpdateProductForm } from '../src/features/product-mutations/UpdateProductForm'
import { DeleteProductForm } from '../src/features/product-mutations/DeleteProductForm'

afterEach(cleanup)

test('the operation forms submit their values through mutation hooks and show the server result', async () => {
  const requests: Request[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      requests.push(request.clone())
      return Response.json({ id: 7, title: 'Server result', price: 15 })
    },
  )
  const store = configureStore({
    reducer: { [productsApi.reducerPath]: productsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
  })
  try {
    render(
      <Provider store={store}>
        <CreateProductForm />
        <UpdateProductForm />
        <DeleteProductForm />
      </Provider>,
    )
    fireEvent.change(screen.getByLabelText('Название'), { target: { value: ' Test ' } })
    fireEvent.change(screen.getByLabelText('Цена нового товара'), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить POST' }))
    await screen.findByText('Server result')
    expect(await requests[0]!.json()).toEqual({ title: 'Test', price: 15 })

    fireEvent.change(screen.getByLabelText('ID изменяемого товара'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('Новая цена'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Метод обновления'), { target: { value: 'PUT' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить PUT' }))
    await waitFor(() => expect(screen.getAllByText('Server result')).toHaveLength(2))
    expect(requests[1]!.method).toBe('PUT')
    expect(await requests[1]!.json()).toEqual({ price: 20 })

    fireEvent.change(screen.getByLabelText('ID удаляемого товара'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить DELETE' }))
    await waitFor(() => expect(screen.getAllByText('Server result')).toHaveLength(3))
    expect(requests[2]!.method).toBe('DELETE')
    expect(new URL(requests[2]!.url).pathname).toBe('/products/7')
  } finally {
    store.dispatch(productsApi.util.resetApiState())
  }
})
