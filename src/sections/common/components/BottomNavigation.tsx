import { UserIcon } from '~/sections/common/components/UserIcon'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  changeToUser,
  currentUserId,
  fetchUsers,
  users,
} from '~/modules/user/application/user'
import { type User } from '~/modules/user/domain/user'
import { For, type JSXElement, Show } from 'solid-js'
import { useLocation, useNavigate } from '@solidjs/router'
import toast from 'solid-toast'

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const { show: showConfirmModal } = useConfirmModalContext()

  console.debug('[BottomNavigation] Rendering')
  console.debug('[BottomNavigation] Current path:', pathname)

  return (
    <div class="">
      {/* Placeholder for bottom navigation when page is 100% scrolled */}
      <div class="h-36 lg:h-24" />
      <div class="fixed z-50 w-full bottom-0 left-0">
        <div class="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-6 left-1/2 dark:bg-slate-800 dark:border-slate-700">
          <div class="grid h-full max-w-lg grid-cols-5 mx-auto pt-1">
            <BottomNavigationTab
              active={pathname === '/diet'}
              label="Home"
              icon={HomeIcon}
              onClick={() => {
                navigate('/diet')
              }}
              position="first"
            />
            <BottomNavigationTab
              active={pathname.startsWith('/profile')}
              label="Perfil"
              icon={ProfileIcon}
              onClick={() => {
                navigate('/profile')
              }}
              position="middle"
            />
            <CTAButton />
            <BottomNavigationTab
              active={pathname.startsWith('/settings')}
              label="Configurações"
              icon={SettingsIcon}
              onClick={() => {
                toast.error('Página ainda não implementada')
              }}
              position="middle"
            />
            <BottomNavigationTab
              active={false}
              label="Usuário"
              icon={(props) => <UserIcon userId={currentUserId()} {...props} />}
              onClick={() => {
                showConfirmModal({
                  title: '',
                  body: () => <UserSelectorDropdown />,
                  actions: [],
                  hasBackdrop: true,
                })
              }}
              position="last"
            />
          </div>
        </div>

        <div class="fixed flex-wrap flex flex-row right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-5 bottom-24 lg:bottom-0 gap-2 bg-slate-800 bg-opacity-80 p-2 rounded">
          <span>Version: {process.env.APP_VERSION}</span>
          <Show when={!window.location.href.includes('stable')}>
            <a
              href="https://marucs-diet-stable.vercel.app/"
              class="align-text-bottom pt-1 text-xs text-blue-500 underline"
              onClick={() => {}}
            >
              Trocar para versão estável
            </a>{' '}
          </Show>
        </div>
      </div>
    </div>
  )
}

function BottomNavigationTab(props: {
  icon: (iconProps: { class?: string }) => JSXElement
  label: string
  active: boolean
  onClick: () => void
  position: 'first' | 'middle' | 'last'
}) {
  function getRound() {
    switch (props.position) {
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
        data-tooltip-target={`tooltip-${props.label}`}
        type="button"
        class={`${getRound()} inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-slate-900 group`}
        onClick={() => {
          props.onClick()
        }}
      >
        {props.icon({
          class: `${
            props.active
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400'
          } w-8 h-8 mb-1  group-hover:text-blue-600 dark:group-hover:text-blue-500`,
        })}
        <span class="sr-only">{props.label}</span>
      </button>
      <div
        id={`tooltip-${props.label}`}
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        {props.label}
        <div class="tooltip-arrow" data-popper-arrow />
      </div>
    </>
  )
}

const HomeIcon = (props: { class?: string }) => (
  <svg
    class={props.class}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
  </svg>
)

const ProfileIcon = (props: { class?: string }) => (
  <svg
    class={props.class}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
  </svg>
)

const SettingsIcon = (props: { class?: string }) => (
  <svg
    class={props.class}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
    />
  </svg>
)

function CTAButton() {
  return (
    <>
      <div class="flex items-center justify-center">
        <button
          data-tooltip-target="tooltip-new"
          type="button"
          class="focus:animate-spin inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus-none dark:focus:ring-blue-800"
        >
          <svg
            class="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span class="sr-only">New item</span>
        </button>
      </div>
      <div
        id="tooltip-new"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        Create new item
        <div class="tooltip-arrow" data-popper-arrow />
      </div>
    </>
  )
}

const UserSelectorDropdown = () => {
  const { show: showConfirmModal, close: closeConfirmModal } =
    useConfirmModalContext()

  fetchUsers().catch((error) => {
    console.error('[UserSelectorDropdown] Error fetching users:', error)
    toast.error('Erro ao buscar usuários')
    closeConfirmModal()
  })

  const handleChangeUser = (user: User) => {
    showConfirmModal({
      title: 'Trocar de usuário',
      body: () => (
        <div class="flex justify-between">
          <span>{`Deseja entrar como ${user.name}?`}</span>
          <UserIcon class="w-16 h-16" userId={user.id} />
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
            changeToUser(user.id)
          },
        },
      ],
    })
  }

  return (
    <div class="flex flex-col gap-1">
      <For each={users()}>
        {(user) => (
          <div
            class="btn btn-ghost flex justify-between"
            onClick={() => {
              handleChangeUser(user)
              // Force dropdown to close without having to click outside setting aria
              // Credit: https://reacthustle.com/blog/how-to-close-daisyui-dropdown-with-one-click
              const dropdown =
                document.activeElement as HTMLAnchorElement | null
              dropdown?.blur()
            }}
          >
            <UserIcon class="w-10 h-10" userId={user.id} />
            <div class="text-xl flex-1 text-start">{user.name}</div>
          </div>
        )}
      </For>
    </div>
  )
}
