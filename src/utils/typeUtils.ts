export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type ObjectValues<T extends object> = T[keyof T]
