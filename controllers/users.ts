import { User } from '@/model/userModel';
import { listAll } from './utils';
import { Record } from 'pocketbase';

const PB_COLLECTION = 'User';

export const listUsers = () => listAll<User & Record>(PB_COLLECTION);