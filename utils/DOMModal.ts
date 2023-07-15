export const showModal = (window: Window & typeof globalThis, id: string) => {
    window[id].showModal();
}

export const hideModal = (window: Window & typeof globalThis, id: string) => {
    window[id].close();
}