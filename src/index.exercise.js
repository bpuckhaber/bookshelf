import * as React from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from '@reach/dialog'
import {Logo} from './components/logo'
import '@reach/dialog/styles.css'

const MODAL_STATE = Object.freeze({
  NONE: 'none',
  LOGIN: 'login',
  REGISTER: 'register',
})

function LoginForm({onSubmit, buttonText}) {
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        const {username, password} = event.target.elements
        onSubmit({
          username: username.value,
          password: password.value,
        })
      }}
    >
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="text" />
      </div>
      <div>
        <button type="submit">{buttonText}</button>
      </div>
    </form>
  )
}

function App() {
  const [openModal, setOpenModal] = React.useState(MODAL_STATE.NONE)

  const closeModal = () => setOpenModal(MODAL_STATE.NONE)

  return (
    <>
      <Logo width="80" height="80" />
      <h1>Bookshelf</h1>
      <div>
        <button
          onClick={() => {
            setOpenModal(MODAL_STATE.LOGIN)
          }}
        >
          Login
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            setOpenModal(MODAL_STATE.REGISTER)
          }}
        >
          Register
        </button>
      </div>
      <Dialog
        isOpen={openModal === MODAL_STATE.LOGIN}
        aria-label="Login Dialog"
      >
        <button onClick={closeModal}>Close</button>
        <h3>Login</h3>
        <LoginForm
          onSubmit={values => {
            console.log(values)
          }}
          buttonText="Login"
        />
      </Dialog>
      <Dialog
        isOpen={openModal === MODAL_STATE.REGISTER}
        aria-label="Register Dialog"
      >
        <button onClick={closeModal}>Close</button>
        <h3>Register</h3>
        <LoginForm
          onSubmit={values => {
            console.log(values)
          }}
          buttonText="Register"
        />
      </Dialog>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
