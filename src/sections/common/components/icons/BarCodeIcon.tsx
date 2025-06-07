import { JSX } from 'solid-js'

export function BarCodeIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
      <rect x="3" y="4" width="1" height="16" />
      <rect x="6" y="4" width="2" height="16" />
      <rect x="10" y="4" width="1" height="16" />
      <rect x="13" y="4" width="2" height="16" />
      <rect x="17" y="4" width="1" height="16" />
      <rect x="20" y="4" width="1" height="16" />
    </svg>
  )
}
