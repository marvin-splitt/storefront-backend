import { PoolClient, QueryResult } from 'pg';
import client from '../database';
import bcrypt from 'bcrypt';

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UserDB extends User {
    readonly id: number;
}

const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

export class UserStore {
    async index(): Promise<UserDB[]> {
        const connection: PoolClient = await client.connect();
        try {
            const sql = 'SELECT * FROM users;';
            const result: QueryResult = await connection.query(sql);
            const users: UserDB[] = result.rows;
            return users;
        } catch (err) {
            throw new Error(`Cannot get users ${err}`);
        } finally {
            connection.release();
        }
    }

    async show(id: number): Promise<UserDB> {
        const connection: PoolClient = await client.connect();
        try {
            const sql = 'SELECT * FROM users WHERE id=($1);';
            const sqlValues = [id];
            const result: QueryResult = await connection.query(sql, sqlValues);
            const user: UserDB = result.rows[0];
            return user;
        } catch (err) {
            throw new Error(`Could not find user with id ${id}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async create(user: User): Promise<UserDB> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *;';

            if (!BCRYPT_PASSWORD) {
                throw new Error('Missing env variable: BCRYPT_PASSWORD');
            }

            if (!SALT_ROUNDS) {
                throw new Error('Missing env variable: SALT_ROUNDS');
            }

            const hash = bcrypt.hashSync(user.password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));
            const sqlValues = [user.firstName, user.lastName, user.email, hash];
            const result: QueryResult = await connection.query(sql, sqlValues);
            const createdUser: UserDB = result.rows[0];

            await connection.query('COMMIT');
            return createdUser;
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not create new user: ${user.firstName} ${user.lastName}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async update(user: UserDB): Promise<UserDB> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'UPDATE users SET first_name=($1), last_name=($2), email=($3), password=($4) WHERE id=($5) RETURNING *;';

            if (!BCRYPT_PASSWORD) {
                throw new Error('Missing env variable: BCRYPT_PASSWORD');
            }

            if (!SALT_ROUNDS) {
                throw new Error('Missing env variable: SALT_ROUNDS');
            }

            const hash = bcrypt.hashSync(user.password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));

            const sqlValues = [user.firstName, user.lastName, user.email, hash, user.id];
            const result: QueryResult = await connection.query(sql, sqlValues);
            const updatedUser: UserDB = result.rows[0];
            await connection.query('COMMIT');
            return updatedUser;
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not update user ${user.email}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async delete(id: number): Promise<UserDB> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const sql = 'DELETE FROM users WHERE id=($1);';
            const sqlValues = [id];
            const result: QueryResult = await connection.query(sql, sqlValues);
            const deletedUser: UserDB = result.rows[0];
            await connection.query('COMMIT');
            return deletedUser;
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not delete user with id ${id}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async authenticate(email: string, password: string): Promise<UserDB | null> {
        const connection: PoolClient = await client.connect();
        try {
            const sql = 'SELECT * FROM users where email=($1);';
            const sqlValues = [email];
            const result: QueryResult = await connection.query(sql, sqlValues);

            if (result.rows.length) {
                const user: UserDB = result.rows[0];

                if (bcrypt.compareSync(password + BCRYPT_PASSWORD, user.password)) {
                    return user;
                }
            }
            return null;
        } catch (err) {
            throw new Error(`Cannot authenticate user ${err}`);
        } finally {
            connection.release();
        }
    }
}
