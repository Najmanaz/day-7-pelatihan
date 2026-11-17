import { PaginationData, PaginationParams } from '../../shared/pagination/pagination.model.js';
import { UserHandler } from './user.handler.js';
import type {
    User,
    UserRecord,
    CreateUserData,
    UpdateUserData
} from './user.model.js';

export interface IUserRepository {

    findAll(
        params: PaginationParams
    ): Promise<PaginationData<User>>;

    findByEmail(
        email: string
    ): Promise<UserRecord | null>;

    create(
        data: CreateUserData
    ): Promise<User>;

    findById(
        id: string
    ): Promise<UserRecord | null>;

    update(
        id: string,
        data: UpdateUserData
    ): Promise<User | null>;

    delete(id: string): Promise<boolean>;
}