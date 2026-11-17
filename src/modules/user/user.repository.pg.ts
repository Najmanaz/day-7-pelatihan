import { randomUUID } from 'node:crypto';

import type { Pool } from 'pg';

import type { IUserRepository } from './user.repository.js';

import type {
    User,
    UserRecord,
    CreateUserData
} from './user.model.js';

import { AppError } from '../../shared/errors/app-error.js';
import { id } from 'zod/locales';

import type { UpdateUserData } from './user.model.js';

import { PaginationParams, PaginationData } from '../../shared/pagination/pagination.model.js';

import { userIdSchema } from './user.validation.js';

export class PostgresUserRepository
implements IUserRepository {

    constructor(private readonly db: Pool) {}

    async findAll(
        params: PaginationParams
    ): Promise<PaginationData<User>> {
        
            // Get total data
            const countResult = await this.db.query(
                `
                SELECT COUNT(*) AS total
                FROM users
               `
            );

            const totalIems = Number(
                countResult.rows[0].total
            );

            // Get paginated data
            const result = await this.db.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    created_at AS "createdAt"
                FROM users
                ORDER BY created_at DESC, id DESC
                LIMIT $1
                OFFSET $2
                `,
                [
                    params.limit,
                    params.offset
                ]
            );

            return {
                items: result.rows as User[],
                totalIems
            };
    }

    async findByEmail(
        email: string
    ): Promise<UserRecord | null> {

        const result = await this.db.query(
            `
            SELECT
                id,
                name,
                email,
                password_hash AS "passwordHash",
                created_at AS "createdAt"
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        return result.rows[0] ?? null;
    }

    async create(
        data: CreateUserData
    ): Promise<User> {

        const id = randomUUID();

        try {

            const result = await this.db.query(
                `
                INSERT INTO users (
                    id,
                    name,
                    email,
                    password_hash
                )
                VALUES ($1, $2, $3, $4)

                RETURNING
                    id,
                    name,
                    email,
                    created_at AS "createdAt"
                `,
                [
                    id,
                    data.name,
                    data.email,
                    data.passwordHash
                ]
            );

            return result.rows[0] as User;

        } catch (error: unknown) {

            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === '23505'
            ) {
                throw new AppError(
                    'Email sudah terdaftar',
                    409
                );
            }

            throw error;
        }
     }

    async update(id: string, data: Partial<User>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    // Hanya masukkan ke query jika datanya beneran dikirim dan ada isinya
    if (data.name !== undefined && data.name !== null) {
      fields.push(`name = $${index}`);
      values.push(data.name);
      index++;
    }

    if (data.email !== undefined && data.email !== null) {
      fields.push(`email = $${index}`);
      values.push(data.email);
      index++;
    }

    // Jika ternyata tidak ada data baru yang valid untuk di-update
    if (fields.length === 0) {
      return null;
    }

    // Tambahkan timestamp otomatis
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Masukkan ID di urutan array paling terakhir
    values.push(id);
    const idIndex = index;

    try {
      const result = await this.db.query(
        `UPDATE users 
         SET ${fields.join(', ')} 
         WHERE id = $${idIndex} 
         RETURNING id, name, email, created_at AS "createdAt"`,
        values
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error di repositori update:", error);
      throw error;
    }
  }
     async findById(
        id: string
    ): Promise<UserRecord | null> {

        const result = await this.db.query(
            `
            SELECT
                id,
                name,
                email,
                password_hash AS "passwordHash",
                created_at AS "createdAt"
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    }

    async delete(id: string): Promise<boolean> {
        try{
            const result = await this.db.query(
                `DELETE FROM users WHERE id = $1`,
                [id]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error("Error di repositori delete:", error);
            throw error;
        }
    }
}
    