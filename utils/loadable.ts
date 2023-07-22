export type Loading = {
    loading: true;
}

export type Loaded<T> = {
    loading: false;
    data: T;
}

export type Loadable<T> = Loading | Loaded<T>;