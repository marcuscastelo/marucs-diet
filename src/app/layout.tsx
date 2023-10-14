import '@/styles/globals.css'
import { Inter } from 'next/font/google'

import ServerApp from '@/sections/common/components/ServerApp'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Marucs Diet',
  description: 'Diet webapp',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Marucs Diet</title>
        <meta name="title" content="Marucs Diet" />
        <meta name="description" content="App de dieta" />
      </head>
      <body className={inter.className + ' dark'}>
        <ServerApp>{children}</ServerApp>
      </body>
    </html>
  )
}
