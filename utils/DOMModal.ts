// TODO: retriggered: this file should not exist, but I can't figure out how to get the modal to work without it

export const showModal = (window: Window & typeof globalThis, id: string) => {
    (window as any)[id].showModal();
}

export const hideModal = (window: Window & typeof globalThis, id: string) => {
    (window as any)[id].close();
}