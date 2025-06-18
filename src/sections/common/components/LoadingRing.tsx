import { cn } from '~/shared/cn'

export function LoadingRing(props: { class?: string } = {}) {
  return (
    <div class={cn('mx-auto flex w-full max-w-xs justify-center', props.class)}>
      <span class="loading loading-ring w-1/2 max-w-xs border text-center" />
    </div>
  )
}
