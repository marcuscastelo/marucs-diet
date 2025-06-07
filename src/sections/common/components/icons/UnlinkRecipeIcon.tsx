import { JSX } from 'solid-js'

export function UnlinkRecipeIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
      <path d="M17 17l-4-4m0 0l-4-4m4 4l4-4m-4 4l-4 4" />
    </svg>
  )
}
