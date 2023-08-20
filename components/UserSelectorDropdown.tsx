'use client'

import { Dropdown } from 'react-daisyui'
import { AvaliableUser } from '@/context/users.context'
import { Loadable } from '@/utils/loadable'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { changeUser } from '@/actions/user'

export default function UserSelectorDropdown({
  availableUsers,
}: {
  availableUsers: Loadable<AvaliableUser[]>
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  const handleChangeUser = (user: AvaliableUser) => {
    showConfirmModal({
      title: 'Trocar de usuário',
      message: `Deseja entrar como ${user.name}?`,
      onConfirm: () => {
        changeUser(user.id)
      },
      onCancel: () => {
        alert('Cancelado')
      },
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
        {availableUsers.loading || availableUsers.errored ? (
          <Dropdown.Item>Carregando...</Dropdown.Item>
        ) : (
          availableUsers.data.map((user, idx) => {
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
          })
        )}

        {!availableUsers.loading &&
          !availableUsers.errored &&
          availableUsers.data.length === 0 && (
            <Dropdown.Item>Nenhum usuário disponível</Dropdown.Item>
          )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
