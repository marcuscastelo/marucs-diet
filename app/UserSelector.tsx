'use client'

import { Dropdown } from 'react-daisyui'
import { Dispatch, SetStateAction, useState } from 'react'
import Link from 'next/link'
import { AvaliableUser, useUserContext } from '@/context/users.context'
import { Loadable } from '@/utils/loadable'
import { User } from '@/model/userModel'
import ConfirmModal from '@/components/ConfirmModal'
import {
  ConfirmModalProvider,
  useConfirmModalContext,
} from '@/context/confirmModal.context'

export default function UserSelector() {
  // TODO: Reenable loading timeout
  // TODO: Move this to a hook
  const [loadingHasTimedOut, setLoadingHasTimedOut] = useState(false)

  const { user, changeUser, availableUsers } = useUserContext()

  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <UserIcon />
      </div>
      <div className="ml-3 flex flex-col gap-1 text-center">
        <div className="text-base font-medium leading-none text-white hover:cursor-pointer hover:text-indigo-200">
          <UserName user={user} loadingHasTimedOut={loadingHasTimedOut} />
        </div>
        <div className="text-sm font-medium leading-none text-slate-300">
          <UsersDropdown
            availableUsers={availableUsers}
            changeUser={(user: AvaliableUser) => {
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
            }}
            loadingHasTimedOut={loadingHasTimedOut}
          />
        </div>
      </div>
      <div className=""></div>
    </div>
  )
}

function UserIcon() {
  return <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
}

function UserName({
  user,
  loadingHasTimedOut,
}: {
  user: Loadable<User>
  loadingHasTimedOut: boolean
}) {
  if (user.loading || user.errored) {
    if (loadingHasTimedOut) {
      return 'Deslogado'
    } else {
      return 'Carregando...'
    }
  }

  return <Link href="/profile">{user.data.name}</Link>
}

function UsersDropdown({
  loadingHasTimedOut,
  availableUsers,
  changeUser,
}: {
  loadingHasTimedOut: boolean
  availableUsers: Loadable<AvaliableUser[]>
  changeUser: (user: AvaliableUser) => void
}) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        color="ghost"
        button={false}
        className="hover:cursor-pointer hover:text-indigo-200"
      >
        {loadingHasTimedOut ? 'Entrar' : 'Trocar'}
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
                  changeUser(user)
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
          availableUsers.data.length ===
            /* TODO: Check if equality is a bug */ 0 && (
            <Dropdown.Item>Nenhum usuário disponível</Dropdown.Item>
          )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
