import { User } from '@/model/userModel';
import { listAll } from './utils';
import { Record } from 'pocketbase';
import pb from '@/utils/pocketBase';

const PB_COLLECTION = 'User';

export const listUsers = async () => await listAll<User>(PB_COLLECTION);

export const updateUser = async (id: string, user: User) => {
    return await pb.collection(PB_COLLECTION).update<Record & User>(id, user, { $autoCancel: false });
}