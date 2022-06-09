import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'pending',
      data: null,
      error: null,
      isIdle: false,
      isLoading: true,
      isError: false,
      isSuccess: false,
    }),
  )

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'resolved',
      data: resolvedValue,
      error: null,
      isIdle: false,
      isLoading: false,
      isError: false,
      isSuccess: true,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )

  let p
  act(() => {
    p = result.current.run(promise).catch(() => {})
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'pending',
      data: null,
      error: null,
      isIdle: false,
      isLoading: true,
      isError: false,
      isSuccess: false,
    }),
  )

  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    reject(rejectedValue)
    await p
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'rejected',
      data: null,
      error: rejectedValue,
      isIdle: false,
      isLoading: false,
      isError: true,
      isSuccess: false,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )
})

test('can specify an initial state', () => {
  const initialData = {foo: 'bar'}
  const customInitialState = {
    status: 'resolved',
    data: initialData,
  }
  const {result} = renderHook(() => useAsync(customInitialState))
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'resolved',
      data: initialData,
      error: null,
      isIdle: false,
      isLoading: false,
      isError: false,
      isSuccess: true,
    }),
  )
})

test('can set the data', async () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )

  const newData = {foo: 'bar'}
  act(() => {
    result.current.setData(newData)
  })

  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'resolved',
      data: newData,
      error: null,
      isIdle: false,
      isLoading: false,
      isError: false,
      isSuccess: true,
    }),
  )
})

test('can set the error', async () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )

  const newError = {foo: 'bar'}
  act(() => {
    result.current.setError(newError)
  })

  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'rejected',
      data: null,
      error: newError,
      isIdle: false,
      isLoading: false,
      isError: true,
      isSuccess: false,
    }),
  )
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
  )

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'pending',
      data: null,
      error: null,
      isIdle: false,
      isLoading: true,
      isError: false,
      isSuccess: false,
    }),
  )

  unmount()
  await act(async () => {
    resolve()
    await p
  })

  expect(result.current).toEqual(
    expect.objectContaining({
      status: 'pending',
      data: null,
      error: null,
      isIdle: false,
      isLoading: true,
      isError: false,
      isSuccess: false,
    }),
  )

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', () => {
  const {result} = renderHook(() => useAsync())

  expect(() => {
    result.current.run()
  }).toThrowError(
    new Error(
      "The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?",
    ),
  )
})
