import { Toaster } from 'solid-toast'

export function DarkToaster() {
  return (
    <Toaster
      toastOptions={{
        className: 'border-2 border-gray-600 p-1',
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
        },
      }}
      position="top-center"
    />
  )
}
