'use client'

import { Dropdown } from 'react-daisyui'
import { AvaliableUser } from '@/context/users.context'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { changeUser } from '@/actions/user'

export default function UserSelectorDropdown({
  availableUsers,
}: {
  availableUsers: AvaliableUser[]
}) {
  return <></>
}
