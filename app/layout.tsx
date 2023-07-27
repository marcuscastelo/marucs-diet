"use client";

import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/redux/provider'
import { useAppDispatch } from '@/redux/hooks';
import { useUser } from '@/redux/features/userSlice';
import { listUsers, updateUser } from '@/controllers/users';
import { User } from '@/model/userModel';
import { useEffect, useState } from 'react';
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
  // Disable SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <></>
  }

  return (
    <html lang="en">
      <head>
        <title>Marucs Diet</title>
        <meta name="title" content="Marucs Diet" />
        <meta
          name="description"
          content="App de dieta" />
      </head>
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
  const { setUserJson } = useUser();

  useEffect(() => {
    const onChangeUser = (user: User) => setUserJson(JSON.stringify(user));

    listUsers().then(users => {
      const localStoredUserId = localStorage.getItem('user');
      if (localStoredUserId) {
        const user = users.find(user => user.id === localStoredUserId);
        if (user) {
          onChangeUser(user)
        } else if (users.length > 0) {
          onChangeUser(users[0])
        }
      } else if (users.length > 0) {
        onChangeUser(users[0])
      }
    });
  }, [setUserJson]);

  return (
    <>{children}</>
  )
}