import { BarCodeIcon } from './icons/BarCodeIcon'

export function BarCodeButton(props: { showBarCodeModal: () => void }) {
  return (
    <>
      <button
        onClick={() => {
          props.showBarCodeModal()
        }}
        class="rounded bg-gray-800 font-bold text-white hover:bg-gray-700 w-16 p-2 hover:scale-110 transition-transform"
      >
        <BarCodeIcon />
      </button>
    </>
  )
}
