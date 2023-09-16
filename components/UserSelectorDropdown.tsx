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
  const { show: showConfirmModal } = useConfirmModalContext()

  const handleChangeUser = (user: AvaliableUser) => {
    showConfirmModal({
      title: 'Trocar de usuário',
      message: `Deseja entrar como ${user.name}?`,
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        {
          primary: true,
          text: 'Entrar',
          onClick: () => {
            changeUser(user.id)
          },
        },
      ],
    })
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        color="ghost"
        button={false}
        className="hover:cursor-pointer hover:text-indigo-200"
      >
        Trocar
      </Dropdown.Toggle>
      <Dropdown.Menu className="no-animation -translate-x-10 translate-y-3 bg-slate-950 outline">
        {availableUsers.map((user, idx) => {
          return (
            <Dropdown.Item
              key={idx}
              onClick={() => {
                handleChangeUser(user)
                // Force dropdown to close without having to click outside setting aria
                // Credit: https://reacthustle.com/blog/how-to-close-daisyui-dropdown-with-one-click
                const dropdown =
                  document.activeElement as HTMLAnchorElement | null
                dropdown?.blur()
              }}
            >
              {user.name}
            </Dropdown.Item>
          )
        })}

        {availableUsers.length === 0 && (
          <Dropdown.Item>Nenhum usuário disponível</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
