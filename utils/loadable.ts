export type Loading<T> = {
    loading: true;
    loadingExtras: T;
}

export type Loaded<T> = {
    loading: false;
    data: T;
}

export type Loadable<TLoaded, TLoading = never> = Loading<TLoading> | Loaded<TLoaded>;