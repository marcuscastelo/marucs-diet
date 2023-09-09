import type { Meta, StoryObj } from '@storybook/react'

import Modal, {
  ModalActions,
  ModalBody,
  ModalHeader,
} from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useState } from 'react'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  decorators: [
    (Story) => {
      const [visible, setVisible] = useState(false)
      return (
        <>
          Visible: {visible ? 'true' : 'false'}
          <button
            className="btn"
            onClick={(e) => {
              e.preventDefault()
              setVisible((v) => !v)
            }}
          >
            Toggle Modal
          </button>
          <ModalContextProvider visible={visible} onSetVisible={setVisible}>
            {Story()}
          </ModalContextProvider>
        </>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof Modal>

export const Root: Story = {
  args: {
    hasBackdrop: true,
    header: (
      <>
        <h1>Header</h1>
      </>
    ),
    body: (
      <>
        <h1>Body</h1>
      </>
    ),
    actions: (
      <>
        <h1>Actions</h1>
      </>
    ),
  },
}

export const Full: Story = {
  args: {
    hasBackdrop: true,
    header: <ModalHeader title="Mock test" />,
    body: <ModalBody />,
    actions: (
      <ModalActions>
        <div className="btn">Action 1</div>
        <div className="btn">Action 2</div>
      </ModalActions>
    ),
  },
}
