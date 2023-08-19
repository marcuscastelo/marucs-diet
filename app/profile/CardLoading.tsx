// TODO: Make this a global component (and maybe use animations with mocked content)
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function CardLoading() {
  return (
    <div
      className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}
    >
      <h5 className={`mx-auto animate-pulse text-center text-3xl font-bold`}>
        Carregando...
      </h5>
    </div>
  )
}
