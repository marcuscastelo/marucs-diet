export function UserInitialFallback(props: { name: string; class?: string }) {
  const initial = () => props.name.trim().charAt(0).toUpperCase()
  return (
    <div
      class={`flex items-center justify-center bg-slate-700 text-white rounded-full font-bold ${props.class ?? ''}`.trim()}
      aria-label={`User initial: ${initial()}`}
      style={{ width: '100%', height: '100%' }}
    >
      <span class="">{initial()}</span>
    </div>
  )
}
