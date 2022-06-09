import * as React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Modal, ModalContents, ModalOpenButton} from '../modal'

test('can be opened and closed', () => {
  const buttonText = 'Open'
  const title = 'My Modal'
  const label = 'My Label'
  const content = 'My Content'

  render(
    <Modal>
      <ModalOpenButton>
        <button>{buttonText}</button>
      </ModalOpenButton>
      <ModalContents title={title} aria-label={label}>
        <div>{content}</div>
      </ModalContents>
    </Modal>,
  )

  userEvent.click(
    screen.getByRole('button', {
      name: buttonText,
    }),
  )

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label', label)

  const inModal = within(modal)
  expect(inModal.getByText(content)).toBeInTheDocument()

  expect(
    inModal.getByRole('heading', {
      name: title,
    }),
  ).toBeInTheDocument()

  userEvent.click(
    inModal.getByRole('button', {
      name: /close/i,
    }),
  )

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
