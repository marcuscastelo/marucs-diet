import { JSX } from 'solid-js'

export function SyncIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="21 2 21 8 15 8" />
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36L21 8M3 16v6h6" />
      <path d="M21 15a9 9 0 0 1-14.13 3.36L3 16" />
    </svg>
  )
}
