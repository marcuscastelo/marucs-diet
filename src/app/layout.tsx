import '@/styles/globals.css'
import { App } from '@/sections/common/components/App'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marucs Diet',
  description: 'Diet webapp',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Marucs Diet</title>
        <meta name="title" content="Marucs Diet" />
        <meta name="description" content="App de dieta" />
      </head>
      <body className={inter.className + ' dark'}>
        <App>
          <h1>aaaa</h1>
        </App>
      </body>
    </html>
  )
}
