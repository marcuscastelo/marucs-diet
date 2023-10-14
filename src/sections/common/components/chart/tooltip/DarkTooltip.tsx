// TODO: Try again to create a DarkTooltip component
// 'use client'

// import { ComponentProps } from 'react'
// import { Tooltip, TooltipProps } from 'recharts'

// export function DarkTooltip({
//   children,
//   content,
//   ...props
// }: {
//   children?: React.ReactNode
//   content: (
//     props: TooltipProps<string | number | (string | number)[], string | number>,
//   ) => React.ReactNode
//   props?: ComponentProps<typeof Tooltip>
// }) {
//   return (
//     <Tooltip
//       {...props}
//       content={({ payload, label, active }) => (
//         <div className="bg-dark p-5 opacity-80">
//           {typeof content === 'function' && content({ payload, label, active })}
//         </div>
//       )}
//     >
//       {children}
//     </Tooltip>
//   )
// }
