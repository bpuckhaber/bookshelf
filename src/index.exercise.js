import * as React from 'react'
import ReactDOM from 'react-dom'
import {Logo} from './components/logo'

function App() {
  return (
    <>
      <Logo width="80" height="80" />
      <h1>Bookshelf</h1>
      <div>
        <button
          onClick={() => {
            alert('Login Clicked')
          }}
        >
          Login
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            alert('Register Clicked')
          }}
        >
          Register
        </button>
      </div>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
