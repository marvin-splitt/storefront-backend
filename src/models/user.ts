import { PoolClient } from 'pg';
import client from '../database';
import bcrypt from 'bcrypt';

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
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
            const users: UserDB[] = (await connection.query(sql)).rows;
            return users.map((({password, ...rest}) => rest));
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
            const users: UserDB[] = (await connection.query(sql, sqlValues)).rows;
            return users.map((({password, ...rest}) => rest))[0];
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
            const exitsingUserSQL = 'SELECT * from users where email=($1);';
            const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *;';

            if (!BCRYPT_PASSWORD) {
                throw new Error('Missing env variable: BCRYPT_PASSWORD');
            }

            if (!SALT_ROUNDS) {
                throw new Error('Missing env variable: SALT_ROUNDS');
            }

            const existingUser = (await connection.query(exitsingUserSQL, [user.email])).rows[0];

            if (existingUser) {
                throw new Error('User does already exist');
            }

            const hash = bcrypt.hashSync(user.password + BCRYPT_PASSWORD, parseInt(SALT_ROUNDS));
            const sqlValues = [user.firstName, user.lastName, user.email, hash];
            const createdUser: UserDB = (await connection.query(sql, sqlValues)).rows[0];

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
            const updatedUser: UserDB = (await connection.query(sql, sqlValues)).rows[0];
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
            const deletedUser: UserDB = (await connection.query(sql, sqlValues)).rows[0];
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

            const user: UserDB = (await connection.query(sql, sqlValues)).rows[0];

            if (!user) {
                throw new Error('Could not find user')
            }

            if (bcrypt.compareSync(password + BCRYPT_PASSWORD, user.password || '')) {
                return user;
            }
            return null;
        } catch (err) {
            throw new Error(`Cannot authenticate user ${err}`);
        } finally {
            connection.release();
        }
    }
}
