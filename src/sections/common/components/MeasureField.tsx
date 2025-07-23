import { FloatInput } from '~/sections/common/components/FloatInput'
import { type useFloatField } from '~/sections/common/hooks/useField'

type MeasureFieldProps = {
  label: string
  field: ReturnType<typeof useFloatField>
}

export function MeasureField(props: MeasureFieldProps) {
  return (
    <div class="flex mb-3">
      <span class="w-1/4 text-center my-auto text-lg">{props.label}</span>
      <FloatInput
        field={props.field}
        class="input px-0 pl-5 text-xl"
        style={{ width: '100%' }}
        onFocus={(event) => {
          event.target.select()
        }}
      />
    </div>
  )
}
