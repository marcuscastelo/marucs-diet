import { Dispatch, SetStateAction } from 'react'

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type State<T> = {
  value: T
  setValue: Dispatch<SetStateAction<T>>
}

export type ObjectValues<T extends object> = T[keyof T]
