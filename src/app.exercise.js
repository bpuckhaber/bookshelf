/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import * as auth from 'auth-provider'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {client} from './utils/api-client'
import {useAsync} from './utils/hooks'
import {FullPageSpinner} from './components/lib'
import * as colors from './styles/colors'

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
  const {
    data: user,
    setData,
    error,
    run,
    isIdle,
    isLoading,
    isError,
    isSuccess,
  } = useAsync()

  React.useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(u => setData(u))
  const register = form => auth.register(form).then(u => setData(u))
  const logout = form => auth.logout(form).then(() => setData(null))

  if (isIdle || isLoading) {
    return <FullPageSpinner />
  }

  if (isError) {
    return (
      <div
        css={{
          color: colors.danger,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    )
  }

  if (isSuccess) {
    if (user == null) {
      return <UnauthenticatedApp login={login} register={register} />
    } else {
      return <AuthenticatedApp user={user} logout={logout} />
    }
  }

  return null
}

export {App}
