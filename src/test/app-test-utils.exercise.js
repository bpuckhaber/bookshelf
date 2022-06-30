import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AppProviders} from 'context'
import * as auth from 'auth-provider'
import {buildUser} from './generate'
import * as usersDB from './data/users'

async function loginAsUser() {
  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
}

function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

async function render(ui, {user: userArg, route, ...options}) {
  const user = userArg !== null ? await loginAsUser() : null

  window.history.pushState({}, 'test page', route)

  const renderResult = rtlRender(ui, {wrapper: AppProviders, ...options})

  await waitForLoadingToFinish()

  return {...renderResult, user}
}

export * from '@testing-library/react'
export {render, userEvent, loginAsUser, waitForLoadingToFinish}
