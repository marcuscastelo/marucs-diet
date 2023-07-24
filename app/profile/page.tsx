'use client';

import { useUser } from "@/redux/features/userSlice";

export default function Page() {
    const currentUser = useUser();
    return (
        <>
            <a href="/">Home</a>
            <h1>Profile</h1>
            <p>Current user: { !currentUser.loading ? currentUser.data?.name : 'Loading user...'}</p>
            <a href="/profile/macros">
                Configurar alvos de macros e calorias
            </a>
        </>
    );
}