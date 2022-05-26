import {server, rest} from 'test/server'
import {client, apiURL} from '../api-client'

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

afterEach(() => {
  server.resetHandlers()
})

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
