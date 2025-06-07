import { JSX } from 'solid-js'

export function RecipeIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
      <path d="M4 4h16v16H4z" />
      <path d="M8 4v16" />
      <circle cx="12" cy="8" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  )
}
