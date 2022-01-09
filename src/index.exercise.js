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
      <Dialog isOpen={openModal === MODAL_STATE.LOGIN}>
        <button onClick={closeModal}>Close</button>
        <h3>Login</h3>
      </Dialog>
      <Dialog isOpen={openModal === MODAL_STATE.REGISTER}>
        <button onClick={closeModal}>Close</button>
        <h3>Register</h3>
      </Dialog>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
