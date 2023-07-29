'use client';

import { useUser } from '@/redux/features/userSlice';
import { listUsers } from '@/controllers/users';
import { User } from '@/model/userModel';

export default function App({ children }: { children: React.ReactNode }) {
    const { setUserJson } = useUser();
    const onChangeUser = (user: User) => setUserJson(JSON.stringify(user));
    listUsers().then(users => {
        const localStoredUserId = ((typeof window !== 'undefined') &&  localStorage) ? parseInt(localStorage.getItem('user') ?? '') : null;
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