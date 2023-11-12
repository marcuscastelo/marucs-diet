import { createSignal, onMount } from 'solid-js'
import { birthdayToday } from '~/modules/congratulate/application/congratulate'
import { currentUser } from '~/modules/user/application/user'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { Confetti } from '~/sections/congratulate/components/Confetti'

export function Congratulate() {
  const [displayConfetti, setDisplayConfetti] = createSignal(true)
  const { show: showConfirmModal } = useConfirmModalContext()
  onMount(() => {
    setTimeout(() => {
      if (birthdayToday()) {
        showConfirmModal({
          title: `Parabéns, ${currentUser()?.name}!`,
          body: (
            <>
              <span>Hoje é seu aniversário!</span>
              <img src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/blogs/19414/images/MoZlBYGxSNeoptiY97Dz_how-to-make-a-birthday-cake-animation.gif" />
            </>
          ),
          actions: [
            {
              text: 'Fechar',
              onClick: () => setDisplayConfetti(false),
              primary: true,
            },
          ],
        })
      }
    }, 1000)
  })

  return (
    <>
      <Confetti show={birthdayToday() && displayConfetti()} />
    </>
  )
}
