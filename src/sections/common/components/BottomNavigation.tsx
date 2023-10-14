'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { UserIcon } from '@/sections/common/components/UserIcon'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { useFetch } from '@/hooks/fetch'
import { fetchUsers } from '@/controllers/users'
import { AvaliableUser, useUserId } from '@/context/users.context'
import { changeUser } from '@/actions/user'

export function BottomNavigation() {
  const router = useRouter()
  const pathName = usePathname()
  const userId = useUserId()
  const { show: showConfirmModal } = useConfirmModalContext()

  console.debug('[BottomNavigation] Rendering')
  console.debug('[BottomNavigation] Current path:', pathName)

  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-slate-800 dark:border-slate-700">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        <BottomNavigationTab
          active={pathName.startsWith('/day')}
          label="Home"
          icon={HomeIcon}
          onClick={() => router.push('/')}
          position="first"
        />
        <BottomNavigationTab
          active={pathName.startsWith('/profile')}
          label="Perfil"
          icon={ProfileIcon}
          onClick={() => router.push('/profile')}
          position="middle"
        />
        <CTAButton />
        <BottomNavigationTab
          active={pathName.startsWith('/settings')}
          label="Configurações"
          icon={SettingsIcon}
          onClick={() => alert('TODO: Ainda não implementado')} // TODO: Change all alerts with ConfirmModal
          position="middle"
        />
        <BottomNavigationTab
          active={pathName.startsWith('/settings')}
          label="Usuário"
          icon={(props) => <UserIcon userId={userId} {...props} />}
          onClick={() =>
            showConfirmModal({
              title: '',
              body: <UserSelectorDropdown />,
              actions: [],
            })
          }
          position="last"
        />
      </div>
    </div>
  )
}

function BottomNavigationTab({
  icon,
  label,
  active,
  onClick,
  position,
}: {
  icon: ({ className }: { className?: string }) => ReactNode
  label: string
  active: boolean
  onClick: () => void
  position: 'first' | 'middle' | 'last'
}) {
  function getRound() {
    switch (position) {
      case 'first':
        return 'rounded-l-full'
      case 'middle':
        return ''
      case 'last':
        return 'rounded-r-full'
    }
  }

  return (
    <>
      <button
        data-tooltip-target={`tooltip-${label}`}
        type="button"
        className={`${getRound()} inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-slate-900 group`}
        onClick={onClick}
      >
        {icon({
          className: `${
            active
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400'
          } w-6 h-6 mb-1  group-hover:text-blue-600 dark:group-hover:text-blue-500`,
        })}
        <span className="sr-only">{label}</span>
      </button>
      <div
        id={`tooltip-${label}`}
        role="tooltip"
        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        {label}
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </>
  )
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
  </svg>
)

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
  </svg>
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
    />
  </svg>
)

function CTAButton() {
  return (
    <>
      <div className="flex items-center justify-center">
        <button
          data-tooltip-target="tooltip-new"
          type="button"
          className="focus:animate-spin inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
        >
          <svg
            className="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span className="sr-only">New item</span>
        </button>
      </div>
      <div
        id="tooltip-new"
        role="tooltip"
        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        Create new item
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </>
  )
}

const UserSelectorDropdown = () => {
  const { show: showConfirmModal } = useConfirmModalContext()

  const { data: availableUsers, fetch } = useFetch(fetchUsers)

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleChangeUser = (user: AvaliableUser) => {
    showConfirmModal({
      title: 'Trocar de usuário',
      body: (
        <div className="flex justify-between">
          <span>{`Deseja entrar como ${user.name}?`}</span>
          <UserIcon className="w-16 h-16" userId={user.id} />
        </div>
      ),
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

  if (availableUsers.loading || availableUsers.errored) {
    return <>Loading available users...</>
  }

  return (
    <div className="flex flex-col gap-1">
      {availableUsers.data.map((user, idx) => {
        return (
          <div
            className="btn btn-ghost flex justify-between"
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
            <UserIcon className="w-10 h-10" userId={user.id} />
            <div className="text-xl flex-1 text-start">{user.name}</div>
          </div>
        )
      })}
    </div>
  )
}
