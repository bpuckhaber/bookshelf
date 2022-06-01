import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server, rest} from 'test/server'
import {client, apiURL} from '../api-client'

jest.mock('react-query')
jest.mock('auth-provider')

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)

  expect(result).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const endpoint = 'test-endpoint'
  const fakeToken = '123'
  let request
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json({}))
    }),
  )

  await client(endpoint, {token: fakeToken})

  expect(request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`)
})

test('allows for config overrides', async () => {
  const endpoint = 'test-endpoint'
  const fakeMode = 'cors'
  const fakeUserAgent = 'client test'
  let request
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json({}))
    }),
  )

  await client(endpoint, {
    mode: fakeMode,
    headers: {'User-Agent': fakeUserAgent},
  })

  expect(request.mode).toEqual(fakeMode)
  expect(request.headers.get('User-Agent')).toBe(fakeUserAgent)
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const mockData = {foo: 'bar'}
  const endpoint = 'test-endpoint'
  let request
  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json({}))
    }),
  )

  await client(endpoint, {data: mockData})

  expect(request.body).toEqual(mockData)
})

test('when response status not in 200-299 then reject with response', async () => {
  const mockResponse = {message: 'this is the response!'}
  const endpoint = 'test-endpoint'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(mockResponse))
    }),
  )

  const fn = async () => {
    await client(endpoint)
  }

  expect(fn).rejects.toEqual(mockResponse)
})

test('logs out the user and clears the query cache when response status is 401', async () => {
  const endpoint = 'test-endpoint'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({}))
    }),
  )

  const error = await client(endpoint).catch(e => e)

  expect(error.message).toMatchInlineSnapshot(`"Please re-authenticate."`)

  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(auth.logout).toHaveBeenCalledTimes(1)
})
