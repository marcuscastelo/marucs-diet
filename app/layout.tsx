"use client";

import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/redux/provider'
import { useAppDispatch } from '@/redux/hooks';
import { setUserJson } from '@/redux/features/userSlice';
import { listUsers } from '@/controllers/users';
import { User } from '@/model/userModel';
import { Record } from 'pocketbase';
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Marucs Diet',
  description: 'Diet webapp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + ' dark'}>
        <Providers>
          <App>
            {children}
          </App>
        </Providers>
      </body>
    </html>
  )
}

function App({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  // const onChangeUser = (user: User & Record) => dispatch(setUser(user));
  // listUsers().then(users => {
  //   if (users.length > 0) {
  //     onChangeUser(users[0])
  //   }
  // })

  return (
    <>{children}</>
  )
}