/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import * as auth from 'auth-provider'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {client} from './utils/api-client'

const getUser = async () => {
  const token = await auth.getToken()
  if (token) {
    const {user} = await client('me', {token})
    return user
  } else {
    return null
  }
}

function App() {
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    getUser().then(u => setUser(u))
  }, [])

  const login = form => auth.login(form).then(u => setUser(u))
  const register = form => auth.register(form).then(u => setUser(u))
  const logout = form => auth.logout(form).then(() => setUser(null))

  return user == null ? (
    <UnauthenticatedApp login={login} register={register} />
  ) : (
    <AuthenticatedApp user={user} logout={logout} />
  )
}

export {App}
