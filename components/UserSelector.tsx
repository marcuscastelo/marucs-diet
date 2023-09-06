import UserSelectorDropdown from './UserSelectorDropdown'
import UserIcon from './UserIcon'
import UserName from './UserName'
import { fetchUsers } from '@/controllers/users'

export default async function UserSelector() {
  const availableUsers = await fetchUsers()

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <UserIcon />
      </div>
      <div className="ml-3 flex flex-col gap-1 text-center">
        <div className="text-base font-medium leading-none text-white hover:cursor-pointer hover:text-indigo-200">
          <UserName />
        </div>
        <div className="text-sm font-medium leading-none text-slate-300">
          <UserSelectorDropdown availableUsers={availableUsers} />
        </div>
      </div>
      <div className=""></div>
    </div>
  )
}
