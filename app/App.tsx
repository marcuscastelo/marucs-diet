'use client';

import { useUser } from '@/redux/features/userSlice';
import { listUsers } from '@/controllers/users';
import { User } from '@/model/userModel';
import { useEffect } from 'react';

export default function App({ children }: { children: React.ReactNode }) {
    //TODO: retriggered: useUser hook (all over the entire app. Search for useAppDispatch, useAppSelector and dispatch)
    const { setUserJson } = useUser();

    useEffect(() => {
        const onChangeUser = (user: User) => setUserJson(JSON.stringify(user));
        // TODO: listUsers should be a hook (useUsers, fetchUsers, etc. see fetchUser in userSlice.ts)
        listUsers().then(users => {
            const localStoredUserId = ((typeof window !== 'undefined') && localStorage) ? parseInt(localStorage.getItem('user') ?? '') : null;
            if (localStoredUserId) {
                const user = users.find(user => user.id === localStoredUserId);
                if (user) {
                    onChangeUser(user)
                } else if (users.length > 0) {
                    onChangeUser(users[0])
                }
            } else if (users.length > 0) {
                onChangeUser(users[0])
            }
        })
    }, [setUserJson]);

    return (
        <>{children}</>
    )
}