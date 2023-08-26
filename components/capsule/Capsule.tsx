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
    <div className={`flex overflow-visible ${className || ''}`}>
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-700 text-left rounded-3xl rounded-r-none`}
      >
        {leftContent}
      </div>
      <div
        className={`flex flex-1 flex-col justify-around bg-slate-900 text-left rounded-3xl rounded-l-none`}
      >
        {rightContent}
      </div>
    </div>
  )
}
