import { User } from '@/model/userModel';
import { listAll } from './utils';
import { Record } from 'pocketbase';
import pb from '@/utils/pocketBase';

const PB_COLLECTION = 'User';

export const listUsers = async () => await listAll<User & Record>(PB_COLLECTION);

export const updateUser = async (id: string, user: User) => {
    return pb.collection(PB_COLLECTION).update(id, user, { $autoCancel: false }) as Promise<Record & User>;
}