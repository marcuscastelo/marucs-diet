'use client'

import { Dropdown } from 'react-daisyui'
import { useState } from 'react'
import Link from 'next/link'
import { useUserContext } from '@/context/users.context'

export default function UserSelector() {
  const [loadingHasTimedOut, setLoadingHasTimedOut] = useState(false)

  const { user, changeUser, availableUsers } = useUserContext()

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
      </div>
      <div className="ml-3 flex flex-col gap-1 text-center">
        <div className="text-base font-medium leading-none text-white hover:cursor-pointer hover:text-indigo-200">
          {user.loading || user.errored ? (
            loadingHasTimedOut ? (
              'Deslogado'
            ) : (
              'Carregando...'
            )
          ) : (
            <Link href="/profile">{user.data.name}</Link>
          )}
        </div>
        <div className="text-sm font-medium leading-none text-slate-300">
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
                        // Prompt user to confirm
                        if (!confirm(`Deseja entrar como ${user.name}?`)) {
                          return
                        }

                        // Prompt username
                        const username = prompt(`Digite '${user.name}':`)
                        if (!username) {
                          return
                        }

                        changeUser(user.id)
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
        </div>
      </div>
      <div className=""></div>
    </div>
  )
}
