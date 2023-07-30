export type Loading<T> = T & {
    loading: true;
}

export type Loaded<T> = {
    loading: false;
    data: T;
}

export type Loadable<TLoaded, TLoading = {}> = Loading<TLoading> | Loaded<TLoaded>;