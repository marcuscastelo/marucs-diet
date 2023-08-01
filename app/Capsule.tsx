'use client'

export default function Capsule({
  leftContent,
  rightContent,
  className,
}: {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex overflow-hidden rounded-3xl ${className || ''}`}>
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-700 text-left`}
      >
        {leftContent}
      </div>
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-900 text-left`}
      >
        {rightContent}
      </div>
    </div>
  )
}
