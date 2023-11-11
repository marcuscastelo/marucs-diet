import { type JSXElement } from 'solid-js'
import { CloseIcon, DateIcon } from './utils'

type ToggleButtonProps = {
  isEmpty: boolean
}

const ToggleButton = (e: ToggleButtonProps): JSXElement => {
  return <>{e.isEmpty ? <DateIcon class="h-5 w-5" /> : <CloseIcon class="h-5 w-5" />}</>
}

export default ToggleButton
