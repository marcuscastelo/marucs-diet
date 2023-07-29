import { User } from '@/model/userModel';
import { listAll } from './utils';
import { Record } from 'pocketbase';
import supabase from '@/utils/supabase';

const TABLE = 'users';

export const listUsers = async (): Promise<User[]> => (await supabase.from(TABLE).select('*')).data ?? [];

export const updateUser = async (id: string, user: User): Promise<User[]> => (await supabase
        .from(TABLE)
        .update(user)
        .eq('id', id)
        .select()).data ?? [];


