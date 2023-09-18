import Link from 'next/link'
import { UserSelector } from '../../components/UserSelector'

export function TopBar() {
  return (
    <div className={`flex justify-between bg-slate-600 p-4`}>
      <Link href="/" className={`my-auto text-xl`}>
        Home
      </Link>
      <UserSelector />
    </div>
  )
}
