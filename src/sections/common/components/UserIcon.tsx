import { type User } from '~/modules/user/domain/user'

export function UserIcon(props: { userId: User['id']; class?: string }) {
  // TODO: validateDOMNesting(...): <div> cannot appear as a descendant of <p>.
  return (
    <div class={props.class}>
      <img
        class="w-full h-full rounded-full"
        src={`https://sbhhxgeaflzmzpmatnir.supabase.co/storage/v1/object/public/uploads/${props.userId}.jpg`}
        sizes="100vw"
        alt=""
        width={0}
        height={0}
      />
    </div>
  )
}
