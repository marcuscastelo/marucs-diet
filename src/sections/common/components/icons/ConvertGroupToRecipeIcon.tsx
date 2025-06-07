import { JSX } from 'solid-js'

export function ConvertGroupToRecipeIcon(
  props: JSX.SvgSVGAttributes<SVGSVGElement>,
) {
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
      <path d="M4 4h16v8H4z" />
      <path d="M4 12h8v8H4z" />
      <path d="M12 12h8v8h-8z" />
    </svg>
  )
}
