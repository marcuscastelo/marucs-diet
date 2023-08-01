export type Loading<T = Record<never, never>> = T & {
  loading: true
}

export type Loaded<T> = {
  loading: false
  data: T
}

export type Loadable<TLoaded, TLoading = Record<never, never>> =
  | Loading<TLoading>
  | Loaded<TLoaded>
