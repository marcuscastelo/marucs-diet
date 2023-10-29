import App from '@/sections/common/components/App'

export default async function ServerApp({
  children,
}: {
  children: React.ReactNode
}) {
  console.debug(`[ServerApp] - Rendering`)

  return <App>{children}</App>
}
