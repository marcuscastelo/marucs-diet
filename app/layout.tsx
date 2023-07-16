"use client";

import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/redux/provider'
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
          {children}
        </Providers>
      </body>
    </html>
  )
}