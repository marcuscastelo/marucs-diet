import type { Meta, StoryObj } from '@storybook/react'

import Modal, {
  ModalActions,
  ModalBody,
  ModalHeader,
} from '../app/(modals)/modal'

const meta: Meta<typeof Modal> = {
  component: Modal,
}

export default meta
type Story = StoryObj<typeof Modal>

export const Root: Story = {
  args: {
    modalId: 'teste123',
    show: true,
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
    modalId: 'teste123',
    show: true,
    hasBackdrop: true,
    header: <ModalHeader />,
    body: <ModalBody />,
    actions: (
      <ModalActions>
        <div className="btn">Action 1</div>
        <div className="btn">Action 2</div>
      </ModalActions>
    ),
  },
}
