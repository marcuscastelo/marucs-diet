import { User } from '@/model/userModel';
import { listAll } from './utils';
import { Record } from 'pocketbase';
import supabase from '@/utils/supabase';

const TABLE = 'users';

export const listUsers = async (): Promise<User[]> => (await supabase.from(TABLE).select('*')).data ?? [];

// export const updateUser = async (id: string, user: User) => {
//     return await pb.collection(TABLE).update<Record & User>(id, user, { $autoCancel: false });
// }