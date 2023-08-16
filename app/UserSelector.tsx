'use client'

import { Dropdown } from 'react-daisyui'
import { Dispatch, SetStateAction, useState } from 'react'
import Link from 'next/link'
import { AvaliableUser, useUserContext } from '@/context/users.context'
import { Loadable } from '@/utils/loadable'
import { User } from '@/model/userModel'
import { ModalContextProvider } from './(modals)/ModalContext'
import Modal, { ModalActions, ModalHeader } from './(modals)/Modal'

export default function UserSelector() {
  // TODO: Reenable loading timeout
  // TODO: Move this to a hook
  const [loadingHasTimedOut, setLoadingHasTimedOut] = useState(false)

  const { user, changeUser, availableUsers } = useUserContext()

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AvaliableUser | undefined>()

  return (
    <div className="flex items-center">
      {!user.loading && !user.errored && (
        <ConfirmModal
          visible={confirmModalVisible}
          setVisible={setConfirmModalVisible}
          onConfirm={() => {
            if (selectedUser) {
              changeUser(selectedUser.id)
              setSelectedUser(undefined)
            }
            setConfirmModalVisible(false)
          }}
          onCancel={() => setConfirmModalVisible(false)}
        >
          <p>
            Tem certeza que deseja entrar como{' '}
            {selectedUser?.name ?? 'BUG: no user selected'}?
          </p>
        </ConfirmModal>
      )}
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
              setSelectedUser(user)
              setConfirmModalVisible(true)
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
                  // // Prompt user to confirm
                  // if (!confirm(`Deseja entrar como ${user.name}?`)) {
                  //   return
                  // }

                  // // Prompt username
                  // const username = prompt(`Digite '${user.name}':`)
                  // if (!username) {
                  //   return
                  // }

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

function ConfirmModal({
  customTitle: title = 'Confirmar',
  onConfirm,
  onCancel,
  children,
  visible,
  setVisible,
}: {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  customTitle?: string
  onConfirm: () => void
  onCancel: () => void
  children: React.ReactNode
}) {
  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      {/* TODO: Move modal-id to ModalContextProvider with a pseudo-random ID generation */}
      <Modal
        modalId={`confirm-modal-${Math.random()}`}
        header={<h1>{title}</h1>}
        body={<p>{children}</p>}
        actions={
          <ModalActions>
            <button className="btn btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              Confirmar
            </button>
          </ModalActions>
        }
      />
    </ModalContextProvider>
  )
}
