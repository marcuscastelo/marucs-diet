import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/redux/provider'

import App from './App';
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

