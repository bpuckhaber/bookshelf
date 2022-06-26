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

const idleState = {
  status: 'idle',
  data: null,
  error: null,
  isIdle: true,
  isLoading: false,
  isError: false,
  isSuccess: false,
}

const pendingState = {
  status: 'pending',
  data: null,
  error: null,
  isIdle: false,
  isLoading: true,
  isError: false,
  isSuccess: false,
}

const resolvedState = {
  status: 'resolved',
  error: null,
  isIdle: false,
  isLoading: false,
  isError: false,
  isSuccess: true,
}

const rejectedState = {
  status: 'rejected',
  data: null,
  isIdle: false,
  isLoading: false,
  isError: true,
  isSuccess: false,
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(expect.objectContaining(idleState))

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(expect.objectContaining(pendingState))

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      ...resolvedState,
      data: resolvedValue,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(expect.objectContaining(idleState))
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(expect.objectContaining(idleState))

  let p
  act(() => {
    p = result.current.run(promise).catch(() => {})
  })
  expect(result.current).toEqual(expect.objectContaining(pendingState))

  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    reject(rejectedValue)
    await p
  })
  expect(result.current).toEqual(
    expect.objectContaining({
      ...rejectedState,
      error: rejectedValue,
    }),
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(expect.objectContaining(idleState))
})

test('can specify an initial state', () => {
  const initialData = {foo: 'bar'}
  const customInitialState = {
    status: 'resolved',
    data: initialData,
  }
  const {result} = renderHook(() => useAsync(customInitialState))
  expect(result.current).toEqual(expect.objectContaining(resolvedState))
})

test('can set the data', async () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(expect.objectContaining(idleState))

  const newData = {foo: 'bar'}
  act(() => {
    result.current.setData(newData)
  })

  expect(result.current).toEqual(
    expect.objectContaining({
      ...resolvedState,
      data: newData,
    }),
  )
})

test('can set the error', async () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(expect.objectContaining(idleState))

  const newError = {foo: 'bar'}
  act(() => {
    result.current.setError(newError)
  })

  expect(result.current).toEqual(expect.objectContaining(rejectedState))
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  expect(result.current).toEqual(expect.objectContaining(idleState))

  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(expect.objectContaining(pendingState))

  unmount()
  await act(async () => {
    resolve()
    await p
  })

  expect(result.current).toEqual(expect.objectContaining(pendingState))

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
