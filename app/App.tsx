'use client';

import { useAppDispatch } from '@/redux/hooks';
import { setUserJson } from '@/redux/features/userSlice';
import { listUsers } from '@/controllers/users';
import { User } from '@/model/userModel';

export default function App({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const onChangeUser = (user: User) => dispatch(setUserJson(JSON.stringify(user)));
    listUsers().then(users => {
        const localStoredUserId = localStorage.getItem('user');
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

    return (
        <>{children}</>
    )
}