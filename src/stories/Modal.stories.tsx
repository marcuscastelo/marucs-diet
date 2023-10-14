import type { Meta, StoryObj } from '@storybook/react'

import Modal, {
  ModalActions,
  ModalBody,
  ModalHeader,
} from '@/sections/common/components/Modal'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { useState } from 'react'
import { useSignal } from '@preact/signals-react'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  decorators: [
    (Story) => {
      const visible = useSignal(false)
      return (
        <>
          Visible: {visible.value ? 'true' : 'false'}
          <button
            className="btn"
            onClick={(e) => {
              e.preventDefault()
              visible.value = !visible.value
            }}
          >
            Toggle Modal
          </button>
          <ModalContextProvider visible={visible}>
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
